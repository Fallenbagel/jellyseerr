import PopupWindow from '@app/utils/popupWindow';
import axios from 'axios';
import Bowser from 'bowser';

interface PlexHeaders extends Record<string, string> {
  Accept: string;
  'X-Plex-Product': string;
  'X-Plex-Version': string;
  'X-Plex-Client-Identifier': string;
  'X-Plex-Model': string;
  'X-Plex-Platform': string;
  'X-Plex-Platform-Version': string;
  'X-Plex-Device': string;
  'X-Plex-Device-Name': string;
  'X-Plex-Device-Screen-Resolution': string;
  'X-Plex-Language': string;
}

export interface PlexPin {
  id: number;
  code: string;
}

const uuidv4 = (): string => {
  return ((1e7).toString() + -1e3 + -4e3 + -8e3 + -1e11).replace(
    /[018]/g,
    function (c) {
      return (
        parseInt(c) ^
        (window.crypto.getRandomValues(new Uint8Array(1))[0] &
          (15 >> (parseInt(c) / 4)))
      ).toString(16);
    }
  );
};

class PlexOAuth extends PopupWindow {
  private plexHeaders?: PlexHeaders;

  private pin?: PlexPin;

  private authToken?: string;

  public initializeHeaders(): void {
    if (!window) {
      throw new Error(
        'Window is not defined. Are you calling this in the browser?'
      );
    }

    let clientId = localStorage.getItem('plex-client-id');
    if (!clientId) {
      const uuid = uuidv4();
      localStorage.setItem('plex-client-id', uuid);
      clientId = uuid;
    }

    const browser = Bowser.getParser(window.navigator.userAgent);
    this.plexHeaders = {
      Accept: 'application/json',
      'X-Plex-Product': 'Overseerr',
      'X-Plex-Version': 'Plex OAuth',
      'X-Plex-Client-Identifier': clientId,
      'X-Plex-Model': 'Plex OAuth',
      'X-Plex-Platform': browser.getBrowserName(),
      'X-Plex-Platform-Version': browser.getBrowserVersion(),
      'X-Plex-Device': browser.getOSName(),
      'X-Plex-Device-Name': `${browser.getBrowserName()} (Overseerr)`,
      'X-Plex-Device-Screen-Resolution':
        window.screen.width + 'x' + window.screen.height,
      'X-Plex-Language': 'en',
    };
  }

  public async getPin(): Promise<PlexPin> {
    if (!this.plexHeaders) {
      throw new Error(
        'You must initialize the plex headers clientside to login'
      );
    }
    const response = await axios.post(
      'https://plex.tv/api/v2/pins?strong=true',
      undefined,
      { headers: this.plexHeaders }
    );

    this.pin = { id: response.data.id, code: response.data.code };

    return this.pin;
  }

  public async preparePopup(): Promise<void> {
    this.openPopup({ title: 'Plex Auth', w: 600, h: 700 });
  }

  public async login(): Promise<string> {
    this.initializeHeaders();
    await this.getPin();

    if (!this.plexHeaders || !this.pin) {
      throw new Error('Unable to call login if class is not initialized.');
    }

    const params = {
      clientID: this.plexHeaders['X-Plex-Client-Identifier'],
      'context[device][product]': this.plexHeaders['X-Plex-Product'],
      'context[device][version]': this.plexHeaders['X-Plex-Version'],
      'context[device][platform]': this.plexHeaders['X-Plex-Platform'],
      'context[device][platformVersion]':
        this.plexHeaders['X-Plex-Platform-Version'],
      'context[device][device]': this.plexHeaders['X-Plex-Device'],
      'context[device][deviceName]': this.plexHeaders['X-Plex-Device-Name'],
      'context[device][model]': this.plexHeaders['X-Plex-Model'],
      'context[device][screenResolution]':
        this.plexHeaders['X-Plex-Device-Screen-Resolution'],
      'context[device][layout]': 'desktop',
      code: this.pin.code,
    };

    if (this.popup) {
      this.popup.location.href = `https://app.plex.tv/auth/#!?${this.encodeData(
        params
      )}`;
    }

    return this.pinPoll();
  }

  private async pinPoll(): Promise<string> {
    const executePoll = async (
      resolve: (authToken: string) => void,
      reject: (e: Error) => void
    ) => {
      try {
        if (!this.pin) {
          throw new Error('Unable to poll when pin is not initialized.');
        }

        const response = await axios.get(
          `https://plex.tv/api/v2/pins/${this.pin.id}`,
          { headers: this.plexHeaders }
        );

        if (response.data?.authToken) {
          this.authToken = response.data.authToken as string;
          this.closePopup();
          resolve(this.authToken);
        } else if (!response.data?.authToken && !this.popup?.closed) {
          setTimeout(executePoll, 1000, resolve, reject);
        } else {
          reject(new Error('Popup closed without completing login'));
        }
      } catch (e) {
        this.closePopup();
        reject(e);
      }
    };

    return new Promise(executePoll);
  }

  private encodeData(data: Record<string, string>): string {
    return Object.keys(data)
      .map(function (key) {
        return [key, data[key]].map(encodeURIComponent).join('=');
      })
      .join('&');
  }
}

export default PlexOAuth;
