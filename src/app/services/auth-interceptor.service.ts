import { HttpInterceptor, HttpRequest, HttpHandler, HttpEventType } from '@angular/common/http';
import { tap } from 'rxjs/operators';

export class AuthInterceptorService implements HttpInterceptor {

    // @ts-ignore
  intercept(req: HttpRequest<any>, next: HttpHandler) {
        // Enter if outgoing response for all data - add the bearer token to all requests
        if(req.url.indexOf('token') == -1) {
            //const curToken = localStorage.getItem("key");
            const curToken = localStorage.getItem("token");
            //console.log("token is " + curToken);
            const modBasicReq = req.clone({
                headers: req.headers.append('Authorization', `Bearer ${curToken}`)
            });

            return next.handle(modBasicReq);
        }

        // Enter if outgoing response for token data only
        else if(req.url.indexOf('token') != -1) {
            const modInitReq = req.clone({
                headers: req.headers.append('Content-Type', 'application/x-www-form-urlencoded')
            });

            console.log("Initial Request", modInitReq);

            return next.handle(modInitReq)
            .pipe(tap(event => {
                if(event.type === HttpEventType.Response) {
                    console.log("RESPONSE", event.body);
                    localStorage.setItem("token", event.body);
                }
            }));
        }
    }
}
