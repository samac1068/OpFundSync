import { HttpInterceptor, HttpRequest, HttpHandler, HttpEventType } from '@angular/common/http';
import {DatastoreService} from "./datastore.service";
import {ConlogService} from "../modules/conlog/conlog.service";
import {Injectable} from "@angular/core";

@Injectable()
export class AuthInterceptorService implements HttpInterceptor {
  constructor(private ds: DatastoreService, private conlog: ConlogService) { }
  intercept(req: HttpRequest<any>, next: HttpHandler) {
    // Need to only attached for POST requests
    if(req.method == 'POST') {
      this.conlog.log("Adding Bearer Token");
      const updatedReq: HttpRequest<any> = req.clone({
        params: req.params.append('Authorization', this.ds.getBearerToken())
      });
      return next.handle(updatedReq);
    } else
      return next.handle(req);
    }
}
