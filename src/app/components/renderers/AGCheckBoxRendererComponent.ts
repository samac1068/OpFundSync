import {Component} from '@angular/core';

@Component({
    selector: 'app-checkbox-renderer',
    template: `<img style="border:0; width:15px; height:15px" src=\"{{ this.imgSrc }}\" alt="">`
})

export class AGCheckBoxRendererComponent {
    params: any;
    imgSrc: string;

    agInit(params: any){
        this.imgSrc = (params.value == true || params.value == 999) ? './assets/images/cbox_checked.png': './assets/images/cbox_open.png';
    }
}
