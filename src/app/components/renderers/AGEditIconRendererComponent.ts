import {Component} from '@angular/core';
import {CommService} from '../../services/comm.service';

@Component({
    selector: 'app-checkbox-renderer',
    template: `<img style="border:0; width:15px; height:15px; cursor: pointer;" src=\"{{ this.imgSrc }}\" alt="" (click)="onCogClick()">`
})

export class AGEditIconRendererComponent {
    params: any;
    imgSrc: string;

    constructor(private comm: CommService){}

    agInit(params: any){
        this.imgSrc = './assets/images/cog.png';
        this.params = params;
    }

    onCogClick(){
      //console.log("Cog Data:", this.params.data);
      this.comm.cogClicked.emit(this.params.data);
    }
}
