export class RequestError extends Error {
  status: number;
  res: Response;

  constructor(res: Response) {
    const status = res.status;
    super(`Request failed with status code ${status}`);
    this.status = status;
    this.res = res;
  }
}
