import {Component, HostListener, OnInit} from '@angular/core';
import {DatastoreService} from './services/datastore.service';
import {DataService} from './services/data.service';
import { LogConsoleDialogComponent } from './modules/conlog/log-console-dialog/log-console-dialog.component';
import { ConlogService } from './modules/conlog/conlog.service';
import { MatDialog } from '@angular/material/dialog';
import {CommService} from "./services/comm.service";
import {User} from "./models/User";
import {CommCheck} from "./models/CommCheck";

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
  commsCheck: any = {id: -1, get: false, post: false, getdone: false, postdone: false};

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
    this.getUserInfo();
    this.getToken();
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

  getUserInfo(){
    // Pull the user's information from the requeststring and parse out the user id for use.
    this.ds.user = new User();
    let user = this.ds.getParamValueQueryString('cid');
    this.ds.user.userid = (user != null && user != undefined) ? parseInt(user) : 7176;
  }

  getToken() {
    // Get the current session bearer token for all post exchange
    this.data.getBearerToken(this.ds.user.userid)
      .subscribe((bearer:any) => {
        this.ds.setBearerToken(bearer.data);

        // If we don't have authorization to even user the API, there is no sense going forward.
        if(this.ds.getBearerToken() == "") {
          this.conlog.log("No Authorization Token Received. User is not Authorized Access.");
          window.alert("No Authorization Token Received. User is not Authorized Access.");
        } else {
          //Make sure the API is available before we start attempting to load anything
          this.conlog.log("authorizationTokenValid");
          this.loading = true;
          this.executeCommsCheck();
        }
      });
  }

  establishAPISession() {
    // Used to request and store an authorization token which will be used throughout this session
    this.conlog.log("validateAPI");
    this.data.apiGetCommsCheck()    // Access via GET
      .subscribe((results) => {
          this.commsCheck.get = (results['message'] == "You have successfully accessed the API using GET with parameter [GET-TEST]");
          this.conlog.log('API GET TEST SUCCEED: ' + this.commsCheck.get);
          this.commsCheck.getdone = true;
        },
        error => {
          console.log("Getting error from API GET Comm Check", error);
          this.ds.system.apiCommCheckPassed = false;
          this.conlog.log("Comms Connection Unsuccessful - OFS");
          this.commsCheck.getdone = true;
        });

    this.data.apiPostCommsCheck()   // Access via POST
      .subscribe((results: CommCheck) => {
          this.commsCheck.post = (results['message'] == "You have successfully accessed the API using POST with parameter [POST-TEST]");
          this.conlog.log('API POST TEST SUCCEED: ' + this.commsCheck.post);
          this.commsCheck.postdone = true;
        },
        error => {
          console.log("Getting error from API POST Comm Check", error);
          this.ds.system.apiCommCheckPassed = false;
          this.conlog.log("Comms Connection Unsuccessful - OFS");
          this.commsCheck.postdone = true;
        });
  }

  executeCommsCheck(){
    // Signal the app to just the API is available and accessible.
    this.establishAPISession();

    // Run interval until check is complete
    this.commsCheck.id = setInterval(() => {
        if(this.commsCheck.getdone && this.commsCheck.postdone) {
          clearInterval(this.commsCheck.id);
          // Make sure we have suitable API Comms communications
          if(this.commsCheck.get && this.commsCheck.post){
            this.ds.system.apiCommCheckPassed = true;
            this.conlog.log("Comms Connection Successful - OFS");
            this.conlog.log("API Path is : " + this.data.getWSPath());
            this.enabled = true;
            this.continueLoading();
          } else {
            this.conlog.log("API Communications Failed. Unable to confirm access via both GET and POST. System Halted.");
          }
        }
      }, 500);
  }

  continueLoading(){
    this.conlog.log("continueLoading");
    if(this.ds.system.apiCommCheckPassed) {
      //Execute a session token before we continue.
      this.conlog.log("getSessionToken for userId: " + this.ds.getUserId());
      this.data.getSessionToken(this.ds.getUserId(), "NULL")
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
}
