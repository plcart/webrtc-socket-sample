export class HttpRequest {

    private res: any;
    private req: any;

    constructor(req, res) {
        this.req = req;
        this.res = res;
    }

    Ok(payload: any) {
        this.res.send(payload);
    }

    InternalServerError(error: string) {
        this.res.statusCode = 500;
        this.res.send(error);
    }

}

export type HttpVerb = 'POST' | 'GET' | 'PUT' | 'DELETE';

export interface IHttpActionResult {
    method: HttpVerb,
    route: string,
    action: string
}
