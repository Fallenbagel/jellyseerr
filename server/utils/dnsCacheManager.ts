import { getSettings } from '@server/lib/settings';
import logger from '@server/logger';
import { LRUCache } from 'lru-cache';
import dns from 'node:dns';

type LookupCallback = (
  err: NodeJS.ErrnoException | null,
  address: string | dns.LookupAddress[] | undefined,
  family?: number
) => void;

type LookupFunction = {
  (hostname: string, callback: LookupCallback): void;
  (
    hostname: string,
    options: dns.LookupOptions,
    callback: LookupCallback
  ): void;
  (
    hostname: string,
    options: dns.LookupOneOptions,
    callback: LookupCallback
  ): void;
  (
    hostname: string,
    options: dns.LookupAllOptions,
    callback: LookupCallback
  ): void;
  (
    hostname: string,
    options: dns.LookupOptions | dns.LookupOneOptions | dns.LookupAllOptions,
    callback: LookupCallback
  ): void;
  __promisify__: typeof dns.lookup.__promisify__;
} & typeof dns.lookup;

interface DnsCache {
  addresses: { ipv4: string[]; ipv6: string[] };
  activeAddress: string;
  family: number;
  timestamp: number;
  ttl: number;
  networkErrors?: number;
  hits: number;
  misses: number;
}

interface CacheStats {
  hits: number;
  misses: number;
  failures: number;
  ipv4Fallbacks: number;
}

class DnsCacheManager {
  private cache: LRUCache<string, DnsCache>;
  private lookupAsync: typeof dns.promises.lookup;
  private resolver: dns.promises.Resolver;
  private stats: CacheStats = {
    hits: 0,
    misses: 0,
    failures: 0,
    ipv4Fallbacks: 0,
  };
  private hardTtlMs: number;
  private maxRetries: number;
  private originalDnsLookup: typeof dns.lookup;
  private originalPromisify: any;

  constructor(maxSize = 500, hardTtlMs = 300000, maxRetries = 3) {
    this.originalDnsLookup = dns.lookup;
    this.originalPromisify = this.originalDnsLookup.__promisify__;

    this.cache = new LRUCache<string, DnsCache>({
      max: maxSize,
      ttl: hardTtlMs,
    });
    this.hardTtlMs = hardTtlMs;
    this.lookupAsync = dns.promises.lookup;
    this.resolver = new dns.promises.Resolver();
    this.maxRetries = maxRetries;
  }

  public initialize(): void {
    const wrappedLookup = ((
      hostname: string,
      options:
        | number
        | dns.LookupOneOptions
        | dns.LookupOptions
        | dns.LookupAllOptions,
      callback: LookupCallback
    ): void => {
      if (typeof options === 'function') {
        callback = options;
        options = {};
      }

      this.lookup(hostname)
        .then((result) => {
          if ((options as dns.LookupOptions).all) {
            const allAddresses: dns.LookupAddress[] = [];

            result.addresses.ipv4.forEach((addr) => {
              allAddresses.push({ address: addr, family: 4 });
            });

            result.addresses.ipv6.forEach((addr) => {
              allAddresses.push({ address: addr, family: 6 });
            });

            callback(
              null,
              allAddresses.length > 0
                ? allAddresses
                : [{ address: result.activeAddress, family: result.family }]
            );
          } else {
            callback(null, result.activeAddress, result.family);
          }
        })
        .catch((error) => {
          logger.warn(
            `Cached DNS lookup failed for ${hostname}, falling back to native DNS: ${error.message}`,
            {
              label: 'DNSCache',
            }
          );

          try {
            this.originalDnsLookup(
              hostname,
              options as any,
              (err, addr, fam) => {
                if (!err && addr) {
                  const cacheEntry = {
                    addresses: {
                      ipv4: Array.isArray(addr)
                        ? addr
                            .filter((a) => !a.address.includes(':'))
                            .map((a) => a.address)
                        : typeof addr === 'string' && !addr.includes(':')
                        ? [addr]
                        : [],
                      ipv6: Array.isArray(addr)
                        ? addr
                            .filter((a) => a.address.includes(':'))
                            .map((a) => a.address)
                        : typeof addr === 'string' && addr.includes(':')
                        ? [addr]
                        : [],
                    },
                    activeAddress: Array.isArray(addr)
                      ? addr[0]?.address || ''
                      : addr,
                    family: Array.isArray(addr)
                      ? addr[0]?.family || 4
                      : fam || 4,
                    timestamp: Date.now(),
                    ttl: 60000,
                    networkErrors: 0,
                    hits: 0,
                    misses: 0,
                  };

                  this.updateCache(hostname, cacheEntry).catch(() => {
                    logger.debug(
                      `Failed to update DNS cache for ${hostname}: ${error.message}`,
                      {
                        label: 'DNSCache',
                      }
                    );
                  });
                }
                callback(err, addr, fam);
              }
            );
            return;
          } catch (fallbackError) {
            logger.error(
              `Native DNS fallback also failed for ${hostname}: ${fallbackError.message}`,
              {
                label: 'DNSCache',
              }
            );
          }

          callback(error, undefined, undefined);
        });
    }) as LookupFunction;

    (wrappedLookup as any).__promisify__ = async function (
      hostname: string,
      options?:
        | dns.LookupAllOptions
        | dns.LookupOneOptions
        | number
        | dns.LookupOptions
    ): Promise<dns.LookupAddress[] | { address: string; family: number }> {
      try {
        const result = await this.lookup(hostname);

        if (
          options &&
          typeof options === 'object' &&
          'all' in options &&
          options.all === true
        ) {
          const allAddresses: dns.LookupAddress[] = [];

          result.addresses.ipv4.forEach((addr: string) => {
            allAddresses.push({ address: addr, family: 4 });
          });

          result.addresses.ipv6.forEach((addr: string) => {
            allAddresses.push({ address: addr, family: 6 });
          });

          return allAddresses.length > 0
            ? allAddresses
            : [{ address: result.activeAddress, family: result.family }];
        }

        return { address: result.activeAddress, family: result.family };
      } catch (error) {
        if (this.originalPromisify) {
          const nativeResult = await this.originalPromisify(
            hostname,
            options as any
          );
          return nativeResult;
        }
        throw error;
      }
    };

    dns.lookup = wrappedLookup;
  }

  async lookup(
    hostname: string,
    retryCount = 0,
    forceIpv4 = false
  ): Promise<DnsCache> {
    if (hostname === 'localhost') {
      return {
        addresses: {
          ipv4: ['127.0.0.1'],
          ipv6: ['::1'],
        },
        activeAddress: '127.0.0.1',
        family: 4,
        timestamp: Date.now(),
        ttl: 0,
        networkErrors: 0,
        hits: 0,
        misses: 0,
      };
    }

    // force ipv4 if configured
    const shouldForceIpv4 = forceIpv4;

    const cached = this.cache.get(hostname);
    if (cached) {
      const age = Date.now() - cached.timestamp;
      const ttlRemaining = Math.max(0, cached.ttl - age);

      if (ttlRemaining > 0) {
        if (
          shouldForceIpv4 &&
          cached.family === 6 &&
          cached.addresses.ipv4.length > 0
        ) {
          const ipv4Address = cached.addresses.ipv4[0];
          logger.debug(
            `Switching from IPv6 to IPv4 for ${hostname} in cypress testing`,
            {
              label: 'DNSCache',
              oldAddress: cached.activeAddress,
              newAddress: ipv4Address,
            }
          );

          this.stats.ipv4Fallbacks++;
          return {
            ...cached,
            activeAddress: ipv4Address,
            family: 4,
          };
        }

        cached.hits++;
        this.stats.hits++;
        return cached;
      }

      // Soft expiration. Will use stale entry while refreshing
      if (age < this.hardTtlMs) {
        cached.misses++;
        this.stats.misses++;

        // Background refresh
        this.resolveWithTtl(hostname)
          .then((result) => {
            const preferredFamily = shouldForceIpv4
              ? 4
              : getSettings().network.forceIpv4First
              ? 4
              : 6;

            const activeAddress = this.selectActiveAddress(
              result.addresses,
              preferredFamily
            );
            const family = activeAddress.includes(':') ? 6 : 4;

            const existing = this.cache.get(hostname);
            this.cache.set(hostname, {
              addresses: result.addresses,
              activeAddress,
              family,
              timestamp: Date.now(),
              ttl: result.ttl,
              networkErrors: 0,
              hits: existing?.hits ?? 0,
              misses: (existing?.misses ?? 0) + 1,
            });
          })
          .catch((error) => {
            logger.error(
              `Failed to refresh DNS for ${hostname}: ${error.message}`
            );
          });

        return cached;
      }

      // Hard expiration to remove stale entry
      this.stats.misses++;
      this.cache.delete(hostname);
    }

    try {
      const result = await this.resolveWithTtl(hostname);

      const preferredFamily = shouldForceIpv4
        ? 4
        : getSettings().network.forceIpv4First
        ? 4
        : 6;

      const activeAddress = this.selectActiveAddress(
        result.addresses,
        preferredFamily
      );
      const family = activeAddress.includes(':') ? 6 : 4;

      const existingMisses = this.cache.get(hostname)?.misses ?? 0;

      const dnsCache: DnsCache = {
        addresses: result.addresses,
        activeAddress,
        family,
        timestamp: Date.now(),
        ttl: result.ttl,
        networkErrors: 0,
        hits: 0,
        misses: existingMisses + 1,
      };

      this.cache.set(hostname, dnsCache);

      return dnsCache;
    } catch (error) {
      this.stats.failures++;

      if (retryCount < this.maxRetries) {
        const backoff = Math.min(100 * Math.pow(2, retryCount), 2000);
        logger.warn(
          `DNS lookup failed for ${hostname}, retrying (${retryCount + 1}/${
            this.maxRetries
          }) after ${backoff}ms`,
          {
            label: 'DNSCache',
            error: error.message,
          }
        );

        await new Promise((resolve) => setTimeout(resolve, backoff));

        // If this is the last retry and was using IPv6 then force IPv4
        const shouldTryIpv4 = retryCount === this.maxRetries - 1 && !forceIpv4;

        return this.lookup(hostname, retryCount + 1, shouldTryIpv4);
      }

      // If there is a stale entry, use it as last resort
      const staleEntry = this.getStaleEntry(hostname);
      if (staleEntry) {
        logger.warn(
          `Using expired DNS cache as fallback for ${hostname} after ${this.maxRetries} failed lookups`,
          {
            label: 'DNSCache',
            activeAddress: staleEntry.activeAddress,
          }
        );

        // If cypress testing and IPv4 addresses are available, use those instead
        if (
          shouldForceIpv4 &&
          staleEntry.family === 6 &&
          staleEntry.addresses.ipv4.length > 0
        ) {
          this.stats.ipv4Fallbacks++;
          const ipv4Address = staleEntry.addresses.ipv4[0];
          logger.debug(
            `Switching expired cache from IPv6 to IPv4 for ${hostname} in test mode`,
            {
              label: 'DNSCache',
              oldAddress: staleEntry.activeAddress,
              newAddress: ipv4Address,
            }
          );

          return {
            ...staleEntry,
            activeAddress: ipv4Address,
            family: 4,
            timestamp: Date.now(),
            ttl: 60000,
          };
        }

        return {
          ...staleEntry,
          timestamp: Date.now(),
          ttl: 60000,
        };
      }

      throw new Error(
        `DNS lookup failed for ${hostname} after ${this.maxRetries} retries: ${error.message}`
      );
    }
  }

  private selectActiveAddress(
    addresses: { ipv4: string[]; ipv6: string[] },
    preferredFamily: number
  ): string {
    if (preferredFamily === 4) {
      return addresses.ipv4.length > 0
        ? addresses.ipv4[0]
        : addresses.ipv6.length > 0
        ? addresses.ipv6[0]
        : '127.0.0.1';
    } else {
      return addresses.ipv6.length > 0
        ? addresses.ipv6[0]
        : addresses.ipv4.length > 0
        ? addresses.ipv4[0]
        : '127.0.0.1';
    }
  }

  private getStaleEntry(hostname: string): DnsCache | null {
    const entry = (this.cache as any).store.get(hostname)?.value;
    if (entry) {
      if (!entry.addresses && entry.address) {
        return {
          addresses: {
            ipv4: entry.family === 4 ? [entry.address] : [],
            ipv6: entry.family === 6 ? [entry.address] : [],
          },
          activeAddress: entry.address,
          family: entry.family,
          timestamp: entry.timestamp,
          ttl: entry.ttl,
          networkErrors: 0,
          hits: entry.hits,
          misses: entry.misses,
        };
      }
      return entry;
    }
    return null;
  }

  private async resolveWithTtl(
    hostname: string
  ): Promise<{ addresses: { ipv4: string[]; ipv6: string[] }; ttl: number }> {
    if (
      !this.resolver ||
      typeof this.resolver.resolve4 !== 'function' ||
      typeof this.resolver.resolve6 !== 'function'
    ) {
      throw new Error('Resolver is not initialized');
    }

    try {
      const [ipv4Records, ipv6Records] = await Promise.allSettled([
        this.resolver.resolve4(hostname, { ttl: true }),
        this.resolver.resolve6(hostname, { ttl: true }),
      ]);

      const addresses = {
        ipv4: [] as string[],
        ipv6: [] as string[],
      };

      let minTtl = 300;

      if (ipv4Records.status === 'fulfilled' && ipv4Records.value.length > 0) {
        addresses.ipv4 = ipv4Records.value.map((record) => record.address);

        // Find minimum TTL from IPv4 records
        const ipv4MinTtl = Math.min(
          ...ipv4Records.value.map((r) => r.ttl || 300)
        );
        if (ipv4MinTtl > 0 && ipv4MinTtl < minTtl) {
          minTtl = ipv4MinTtl;
        }
      }

      if (ipv6Records.status === 'fulfilled' && ipv6Records.value.length > 0) {
        addresses.ipv6 = ipv6Records.value.map((record) => record.address);

        // Find minimum TTL from IPv6 records
        const ipv6MinTtl = Math.min(
          ...ipv6Records.value.map((r) => r.ttl || 300)
        );
        if (ipv6MinTtl > 0 && ipv6MinTtl < minTtl) {
          minTtl = ipv6MinTtl;
        }
      }

      if (addresses.ipv4.length === 0 && addresses.ipv6.length === 0) {
        throw new Error(`No DNS records found for ${hostname}`);
      }

      const ttlMs = minTtl * 1000;

      return { addresses, ttl: ttlMs };
    } catch (error) {
      logger.error(`Failed to resolve ${hostname} with TTL: ${error.message}`, {
        label: 'DNSCache',
      });
      throw error;
    }
  }

  /**
   * Updates the cache with an externally provided entry
   * Used for updating cache from fallback DNS lookups
   */
  async updateCache(hostname: string, entry: DnsCache): Promise<void> {
    if (!entry || !entry.activeAddress || !entry.addresses) {
      throw new Error('Invalid cache entry provided');
    }

    const validatedEntry: DnsCache = {
      addresses: {
        ipv4: Array.isArray(entry.addresses.ipv4) ? entry.addresses.ipv4 : [],
        ipv6: Array.isArray(entry.addresses.ipv6) ? entry.addresses.ipv6 : [],
      },
      activeAddress: entry.activeAddress,
      family: entry.family || (entry.activeAddress.includes(':') ? 6 : 4),
      timestamp: entry.timestamp || Date.now(),
      ttl: entry.ttl || 60000,
      networkErrors: entry.networkErrors || 0,
      hits: entry.hits || 0,
      misses: entry.misses || 0,
    };

    if (
      validatedEntry.addresses.ipv4.length === 0 &&
      validatedEntry.addresses.ipv6.length === 0
    ) {
      if (validatedEntry.activeAddress.includes(':')) {
        validatedEntry.addresses.ipv6.push(validatedEntry.activeAddress);
      } else {
        validatedEntry.addresses.ipv4.push(validatedEntry.activeAddress);
      }
    }

    const existing = this.cache.get(hostname);
    if (existing) {
      const mergedEntry: DnsCache = {
        addresses: {
          ipv4: [
            ...new Set([
              ...existing.addresses.ipv4,
              ...validatedEntry.addresses.ipv4,
            ]),
          ],
          ipv6: [
            ...new Set([
              ...existing.addresses.ipv6,
              ...validatedEntry.addresses.ipv6,
            ]),
          ],
        },
        activeAddress: validatedEntry.activeAddress,
        family: validatedEntry.family,
        timestamp: validatedEntry.timestamp,
        ttl: validatedEntry.ttl,
        networkErrors: 0,
        hits: 0,
        misses: 0,
      };

      this.cache.set(hostname, mergedEntry);
      logger.debug(`Updated DNS cache for ${hostname} with merged entry`, {
        label: 'DNSCache',
        addresses: {
          ipv4: mergedEntry.addresses.ipv4.length,
          ipv6: mergedEntry.addresses.ipv6.length,
        },
        activeAddress: mergedEntry.activeAddress,
        family: mergedEntry.family,
      });
    } else {
      this.cache.set(hostname, validatedEntry);
      logger.debug(`Added new DNS cache entry for ${hostname}`, {
        label: 'DNSCache',
        addresses: {
          ipv4: validatedEntry.addresses.ipv4.length,
          ipv6: validatedEntry.addresses.ipv6.length,
        },
        activeAddress: validatedEntry.activeAddress,
        family: validatedEntry.family,
      });
    }

    return Promise.resolve();
  }

  /**
   * Fallback DNS lookup when cache fails
   * Respects system DNS configuration
   */
  async fallbackLookup(hostname: string): Promise<DnsCache> {
    logger.warn(`Performing fallback DNS lookup for ${hostname}`, {
      label: 'DNSCache',
    });

    // Try different DNS resolution methods
    const strategies = [
      this.tryNodeDefaultLookup.bind(this),
      this.tryNodePromisesLookup.bind(this),
    ];

    let lastError: Error | null = null;

    for (const strategy of strategies) {
      try {
        const result = await strategy(hostname);
        if (
          result &&
          (result.addresses.ipv4.length > 0 || result.addresses.ipv6.length > 0)
        ) {
          return result;
        }
      } catch (error) {
        lastError = error;
        logger.debug(
          `Fallback strategy failed for ${hostname}: ${error.message}`,
          {
            label: 'DNSCache',
            strategy: strategy.name,
          }
        );
      }
    }

    throw (
      lastError ||
      new Error(`All DNS fallback strategies failed for ${hostname}`)
    );
  }

  /**
   * Attempt lookup using Node's default dns.lookup
   */
  private async tryNodeDefaultLookup(hostname: string): Promise<DnsCache> {
    return new Promise((resolve, reject) => {
      dns.lookup(hostname, { all: true }, (err, addresses) => {
        if (err) {
          reject(err);
          return;
        }

        if (!addresses || addresses.length === 0) {
          reject(new Error('No addresses returned'));
          return;
        }

        const ipv4Addresses = addresses
          .filter((a) => a.family === 4)
          .map((a) => a.address);

        const ipv6Addresses = addresses
          .filter((a) => a.family === 6)
          .map((a) => a.address);

        const preferIpv4 = getSettings().network.forceIpv4First;

        let activeAddress: string;
        let family: number;

        if (preferIpv4 && ipv4Addresses.length > 0) {
          activeAddress = ipv4Addresses[0];
          family = 4;
        } else if (ipv6Addresses.length > 0) {
          activeAddress = ipv6Addresses[0];
          family = 6;
        } else if (ipv4Addresses.length > 0) {
          activeAddress = ipv4Addresses[0];
          family = 4;
        } else {
          reject(new Error('No valid addresses found'));
          return;
        }

        resolve({
          addresses: { ipv4: ipv4Addresses, ipv6: ipv6Addresses },
          activeAddress,
          family,
          timestamp: Date.now(),
          ttl: 60000,
          networkErrors: 0,
          hits: 0,
          misses: 0,
        });
      });
    });
  }

  /**
   * Try lookup using Node's dns.promises API directly
   * This uses a different internal implementation than dns.lookup
   */
  private async tryNodePromisesLookup(hostname: string): Promise<DnsCache> {
    const resolver = new dns.promises.Resolver();

    const [ipv4Results, ipv6Results] = await Promise.allSettled([
      resolver.resolve4(hostname).catch(() => []),
      resolver.resolve6(hostname).catch(() => []),
    ]);

    const ipv4Addresses =
      ipv4Results.status === 'fulfilled' ? ipv4Results.value : [];
    const ipv6Addresses =
      ipv6Results.status === 'fulfilled' ? ipv6Results.value : [];

    if (ipv4Addresses.length === 0 && ipv6Addresses.length === 0) {
      throw new Error('No addresses resolved');
    }

    const preferIpv4 = getSettings().network.forceIpv4First;
    let activeAddress: string;
    let family: number;

    if (preferIpv4 && ipv4Addresses.length > 0) {
      activeAddress = ipv4Addresses[0];
      family = 4;
    } else if (ipv6Addresses.length > 0) {
      activeAddress = ipv6Addresses[0];
      family = 6;
    } else {
      activeAddress = ipv4Addresses[0];
      family = 4;
    }

    return {
      addresses: { ipv4: ipv4Addresses, ipv6: ipv6Addresses },
      activeAddress,
      family,
      timestamp: Date.now(),
      ttl: 30000,
      networkErrors: 0,
      hits: 0,
      misses: 0,
    };
  }

  reportNetworkError(hostname: string) {
    const entry = this.cache.get(hostname);
    if (entry) {
      if (!entry.addresses && (entry as any).address) {
        const oldEntry = entry as any;
        entry.addresses = {
          ipv4: oldEntry.family === 4 ? [oldEntry.address] : [],
          ipv6: oldEntry.family === 6 ? [oldEntry.address] : [],
        };
        entry.activeAddress = oldEntry.address;
        delete (entry as any).address;
      }

      entry.networkErrors = (entry.networkErrors || 0) + 1;

      // If there are multiple network errors for this address and alternatives exist, then switch
      if (entry.networkErrors > 2) {
        if (entry.family === 6 && entry.addresses.ipv4.length > 0) {
          logger.info(
            `Switching ${hostname} from IPv6 to IPv4 after network errors`,
            {
              label: 'DNSCache',
              oldAddress: entry.activeAddress,
              newAddress: entry.addresses.ipv4[0],
              errors: entry.networkErrors,
            }
          );

          entry.activeAddress = entry.addresses.ipv4[0];
          entry.family = 4;
          entry.networkErrors = 0;
        } else if (entry.family === 4 && entry.addresses.ipv4.length > 1) {
          const currentIndex = entry.addresses.ipv4.indexOf(
            entry.activeAddress
          );
          const nextIndex = (currentIndex + 1) % entry.addresses.ipv4.length;

          logger.info(
            `Rotating to next IPv4 address for ${hostname} after network errors`,
            {
              label: 'DNSCache',
              oldAddress: entry.activeAddress,
              newAddress: entry.addresses.ipv4[nextIndex],
              errors: entry.networkErrors,
            }
          );

          entry.activeAddress = entry.addresses.ipv4[nextIndex];
          entry.networkErrors = 0;
        }
      }
    }
  }

  getStats() {
    return {
      size: this.cache.size,
      maxSize: this.cache.max,
      hits: this.stats.hits,
      misses: this.stats.misses,
      failures: this.stats.failures,
      ipv4Fallbacks: this.stats.ipv4Fallbacks,
      hitRate: this.stats.hits / (this.stats.hits + this.stats.misses || 1),
    };
  }

  getCacheEntries() {
    const entries: Record<
      string,
      {
        addresses: { ipv4: number; ipv6: number };
        activeAddress: string;
        family: number;
        age: number;
        ttl: number;
        networkErrors?: number;
        hits: number;
        misses: number;
      }
    > = {};

    for (const [hostname, data] of this.cache.entries()) {
      const age = Date.now() - data.timestamp;
      const ttl = Math.max(0, data.ttl - age);

      entries[hostname] = {
        addresses: {
          ipv4: data.addresses.ipv4.length,
          ipv6: data.addresses.ipv6.length,
        },
        activeAddress: data.activeAddress,
        family: data.family,
        age,
        ttl,
        networkErrors: data.networkErrors,
        hits: data.hits,
        misses: data.misses,
      };
    }

    return entries;
  }

  getCacheEntry(hostname: string) {
    const entry = this.cache.get(hostname);
    if (!entry) {
      return null;
    }

    return {
      addresses: {
        ipv4: entry.addresses.ipv4.length,
        ipv6: entry.addresses.ipv6.length,
      },
      activeAddress: entry.activeAddress,
      family: entry.family,
      age: Date.now() - entry.timestamp,
      ttl: Math.max(0, entry.ttl - (Date.now() - entry.timestamp)),
      networkErrors: entry.networkErrors,
    };
  }

  clearHostname(hostname: string): void {
    if (!hostname || hostname.length === 0) {
      return;
    }

    if (this.cache.has(hostname)) {
      this.cache.delete(hostname);
      logger.debug(`Cleared DNS cache entry for ${hostname}`, {
        label: 'DNSCache',
      });
    }
  }

  clear(hostname?: string): void {
    if (hostname && hostname.length > 0) {
      this.clearHostname(hostname);
      return;
    }

    this.cache.clear();
    this.stats.hits = 0;
    this.stats.misses = 0;
    this.stats.failures = 0;
    this.stats.ipv4Fallbacks = 0;
    logger.debug('DNS cache cleared', { label: 'DNSCache' });
  }
}

export const dnsCache = new DnsCacheManager();

// For better error handling in fetch operations
if (typeof global.fetch === 'function') {
  const originalFetch = global.fetch;

  global.fetch = async function (
    ...args: Parameters<typeof originalFetch>
  ): Promise<Response> {
    try {
      const response = await originalFetch(...args);
      return response;
    } catch (error) {
      try {
        let hostname = '';
        const firstArg = args[0];

        if (typeof firstArg === 'string') {
          hostname = new URL(firstArg).hostname;
        } else if (firstArg instanceof URL) {
          hostname = firstArg.hostname;
        } else if (firstArg instanceof Request) {
          hostname = new URL(firstArg.url).hostname;
        }

        if (hostname && error.message?.includes('fetch failed')) {
          dnsCache.reportNetworkError(hostname);
          logger.warn(
            `Reporting network error for ${hostname}: ${error.message}`,
            {
              label: 'FetchInterceptor',
            }
          );
        }
      } catch (urlError) {
        //
      }

      throw error;
    }
  } as typeof global.fetch;
}
