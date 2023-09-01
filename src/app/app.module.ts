import {CUSTOM_ELEMENTS_SCHEMA, NgModule} from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppComponent } from './app.component';
import {CommonModule, NgOptimizedImage} from "@angular/common";
import {FormsModule} from "@angular/forms";
import {HTTP_INTERCEPTORS, HttpClientModule} from '@angular/common/http';

// 3rd Party Components
import { AngularDualListBoxModule } from "angular-dual-listbox";
import { NgxSpinnerModule } from "ngx-spinner";
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AgGridModule } from '@ag-grid-community/angular';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { AGCheckBoxRendererComponent } from './components/renderers/AGCheckBoxRendererComponent'
import {AGEditIconRendererComponent} from './components/renderers/AGEditIconRendererComponent';
import { ToastNotificationsModule } from 'ngx-toast-notifications';

// Services
import { ConlogService } from './modules/conlog/conlog.service';
import { DataService } from './services/data.service';
import { DatastoreService } from './services/datastore.service';
import { ConlogModule } from './modules/conlog/conlog.module';
import {CommService} from './services/comm.service';
import {AuthInterceptorService} from "./services/auth-interceptor.service";

// Components
import { BannerComponent } from './components/banner/banner.component';
import { NavbarComponent } from './components/navbar/navbar.component';
import { OfsbuttonComponent } from './components/ofsbutton/ofsbutton.component';
import {DatawindowComponent} from './components/datawindow/datawindow.component';
import {OrdersComponent} from './components/updaters/orders/orders.component';
import {PayComponent} from './components/updaters/pay/pay.component';
import {TcsComponent} from './components/updaters/tcs/tcs.component';
import {ConusaComponent} from './components/updaters/conusa/conusa.component';
import {MissionlocationComponent} from './components/updaters/missionlocation/missionlocation.component';
import {FundcitesComponent} from './components/updaters/fundcites/fundcites.component';
import {OperationsComponent} from './components/updaters/operations/operations.component';
import {TpfddComponent} from './components/updaters/tpfdd/tpfdd.component';
import {BtnGroupComponent} from './components/updaters/btn-group/btn-group.component';
import {ConfirmDialogComponent} from './dialog/confirm-dialog/confirm-dialog.component';
import {CyclesComponent} from './components/updaters/cycles/cycles.component';
import {OperationDialogComponent} from './dialog/operation-dialog/operation-dialog.component';
import {LocationsDialogComponent} from './dialog/locations-dialog/locations-dialog.component';

// Angular Material Components
import { MatDialogModule } from "@angular/material/dialog";
import {MatTableModule} from '@angular/material/table';
import {MatSortModule} from '@angular/material/sort';
import {MatPaginatorModule} from '@angular/material/paginator';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {UpdatePanelComponent} from './components/update-panel/update-panel.component';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatSelectModule} from '@angular/material/select';
import {ReactiveFormsModule} from '@angular/forms';
import {DampsComponent} from './components/updaters/damps/damps.component';
import {MatCardModule} from '@angular/material/card';
import {MatDatepickerModule} from '@angular/material/datepicker';
import {MatNativeDateModule} from '@angular/material/core';
import {MatExpansionModule} from '@angular/material/expansion';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {MatSnackBarModule} from "@angular/material/snack-bar";


@NgModule({
  declarations: [
    AppComponent,
    BannerComponent,
    NavbarComponent,
    OfsbuttonComponent,
    DatawindowComponent,
    UpdatePanelComponent,
    BtnGroupComponent,
    ConfirmDialogComponent,
    DampsComponent,
    OrdersComponent,
    PayComponent,
    TcsComponent,
    ConusaComponent,
    MissionlocationComponent,
    FundcitesComponent,
    OperationsComponent,
    TpfddComponent,
    CyclesComponent,
    OperationDialogComponent,
    LocationsDialogComponent,
    AGCheckBoxRendererComponent,
    AGEditIconRendererComponent
  ],
  imports: [
    BrowserModule,
    CommonModule,
    ConlogModule,
    FormsModule,
    ReactiveFormsModule,
    NgbModule,
    NgxSpinnerModule.forRoot({type: 'timer'}),
    AngularDualListBoxModule,
    BrowserAnimationsModule,
    AgGridModule,
    FontAwesomeModule,
    MatDialogModule,
    NgOptimizedImage,
    HttpClientModule,
    MatTableModule,
    MatSortModule,
    MatPaginatorModule,
    MatCheckboxModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    ReactiveFormsModule,
    MatCardModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatExpansionModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    ToastNotificationsModule
  ],
  providers: [
    ConlogService,
    DataService,
    DatastoreService,
    CommService,
    Location,
    {provide: HTTP_INTERCEPTORS, useClass: AuthInterceptorService, multi:true}
  ],
  bootstrap: [AppComponent],
  entryComponents: [
    ConfirmDialogComponent,
    OperationDialogComponent,
    LocationsDialogComponent
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class AppModule { }
