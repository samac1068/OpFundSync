import {Component, HostListener, OnInit} from '@angular/core';
import {DatastoreService} from './services/datastore.service';
import {DataService} from './services/data.service';
import { LogConsoleDialogComponent } from './modules/conlog/log-console-dialog/log-console-dialog.component';
import { ConlogService } from './modules/conlog/conlog.service';
import { MatDialog } from '@angular/material/dialog';
import {CommService} from "./services/comm.service";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'Operation Fund Synchronization';
  isConsoleOpen: boolean = false;
  dialogQuery: any;
  enabled: boolean = false;
  loading: boolean = true;
  constructor(private ds: DatastoreService, private data: DataService, private conlog: ConlogService, public dialog: MatDialog, private comm: CommService) { }

  // Adding global host listener for single global keyboard command of CTRL+\
  @HostListener('document:keypress', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    if(event.ctrlKey && event.code == "KeyY") {
      // A request to open the logging console has been executed
      if(!this.isConsoleOpen) {
        this.isConsoleOpen = true;
        this.dialogQuery = this.dialog.open(LogConsoleDialogComponent, {
          width: '650px',
          height: '870px',
          autoFocus: false,
          position: { right: '20px', top: '10px'}
        });

        this.dialogQuery.afterClosed().subscribe(() => {
          this.isConsoleOpen = false;
        });
      } else {
        // close the window, but keep the information.
        this.dialogQuery.close();
      }
    }
  }

  ngOnInit() {
    this.getSystemConfig();

    //Make sure the API is available before we start attempting to load anything
    this.conlog.log("validateAPI");
    this.loading = true;
    this.data.apiGetCommsCheck()
      .subscribe((results) => {
          if(results['message'] == "Comms Successful - OFS") {
            this.ds.system.apiCommCheckPassed = true;
            this.conlog.log("Comms Connection Successful - OFS");
            this.conlog.log("API Path is : " + this.data.getWSPath());
            this.enabled = true;
            this.continueLoading();
          }
        },
        error => {
          console.log("Getting error from API Comm Check", error);
          this.ds.system.apiCommCheckPassed = false;
          this.conlog.log("Comms Connection Unsuccessful - OFS");
      });
  }

  continueLoading(){
    this.conlog.log("continueLoading");
    if(this.ds.system.apiCommCheckPassed) {
      //Execute a session token before we continue.
      /* TODO: Need to pull in either the username or the userid for this user ( probably in bridge ID - then we can update versus create a token) */
      this.conlog.log("Forced a specific user at this moment: 7176. getSessionToken");
      this.data.getSessionToken(7176, "NULL")
        .subscribe((results: any) => {
          if (results['token'] != "") {
            if (results['token'].substring(0, 2) == "ERR") {
              switch (results['token']) {
                case "ERR201":
                  this.ds.generateToast("You must provide either a User ID or Username to gain access to this application. Attempt Aborted", false);
                  break;
                case "ERR202":
                  this.ds.generateToast("Your username does not exist within the MDIS user table. Attempt Aborted.", false);
                  break;
              }
            } else {
              // Wait 1/2 sec then load the default (DAMPS) information  <--- This is what starts the application to load the data
              this.conlog.log("SessionToken Information returned. (" + results['token'] + ")");
              this.ds.user['sKey'] = results['token'];
              this.conlog.log("Session Token was valid. Information Stored.");
              setTimeout(() => {
                this.conlog.log("Grabbing DAMPS information.");
                this.ds.curSelectedButton = "damps"
                this.comm.navbarClicked.emit();
              }, 500);
            }
          }
        });
    } else
      this.ds.generateToast("Communications to the API failed. System Aborted.", false);
  }
  getSystemConfig() {
    // Collect the information from the config.xml file and set the appropriate database location
    this.conlog.log("getSystenConfig");
    const results: any = this.data.getSystemConfig();
    this.ds.system.network = results.network
    this.ds.system.type = results.type;
    this.ds.system.devMode = (results.type === "development");
    this.ds.system.path = results.path;
  }
}

