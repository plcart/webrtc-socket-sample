import { Controller, HttpMethod } from '../helpers/controller.helper';
import { HttpRequest } from '../helpers/http-request.helper';

export class HomeController extends Controller {

    @HttpMethod({ route: '/hello/:user', method: 'GET', action: 'hello' })
    hello({ user }, http: HttpRequest) {
        http.Ok(`Hi ${user}`);
    }

}