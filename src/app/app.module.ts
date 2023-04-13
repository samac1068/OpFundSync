import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppComponent } from './app.component';

// 3rd Party Components
import { AngularDualListBoxModule } from "angular-dual-listbox";
import { NgxSpinnerModule } from "ngx-spinner";
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AgGridModule } from '@ag-grid-community/angular';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

// Services


// Components



// Angular Material Components


@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    NgbModule,
    NgxSpinnerModule,
    AngularDualListBoxModule,
    BrowserAnimationsModule,
    AgGridModule,
    FontAwesomeModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
