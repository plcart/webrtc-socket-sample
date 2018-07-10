import { HttpRequest, IHttpActionResult } from './http-request.helper'

export class Controller {
    static routes: IHttpActionResult[] = [];
    public register(app): void {
        Controller.routes.forEach(http => {
            switch (http.method) {
                case 'GET': {
                    app.get(http.route, (req, res) => {
                        this[http.action](req.params, new HttpRequest(req, res));
                    });
                    break;
                }
                case 'POST': {
                    app.post(http.route, (req, res) => {
                        this[http.action]({ ...req.params, ...req.body }, new HttpRequest(req, res));
                    });
                    break;
                }
                case 'PUT': {
                    app.put(http.route, (req, res) => {
                        this[http.action]({ ...req.params, ...req.body }, new HttpRequest(req, res));
                    });
                    break;
                }
                case 'DELETE': {
                    app.delete(http.route, (req, res) => {
                        this[http.action](req.params, new HttpRequest(req, res));
                    });
                }

            }
        });
    }
}

export function HttpMethod(params: IHttpActionResult) {
    return (target: Controller, propertyKey: string, descriptor: PropertyDescriptor) => {
        Controller.routes.push({ ...params, action: propertyKey });
    }
}