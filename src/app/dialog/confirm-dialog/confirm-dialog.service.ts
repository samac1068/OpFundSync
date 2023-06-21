import { Injectable } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ConfirmDialogComponent } from './confirm-dialog.component';

@Injectable({
  providedIn: 'root'
})
export class ConfirmDialogService {

  constructor(private modalService: NgbModal) { }
  // confirm(title, message, okbtntext, cancelbtntext, dialogsize)
  public confirm(
    title: string,
    message: string,
    btnOkText: string = 'OK',
    btnCancelText: string = 'Cancel',
    dialogSize: 'sm'|'lg' = 'sm'): Promise<boolean> {
      const modalRef = this.modalService.open(ConfirmDialogComponent, { size: dialogSize, centered: true });
      modalRef.componentInstance.title = title;
      modalRef.componentInstance.message = message;
      modalRef.componentInstance.btnOkText = btnOkText;
      modalRef.componentInstance.btnCancelText = btnCancelText;
      modalRef.componentInstance.isAcknowledgeOnly = false;
  
      return modalRef.result;
    }

  public acknowledge(
    title: string,
    message: string,
    btnCancelText: string = 'OK',
    dialogSize: 'sm'|'lg' = 'sm'): Promise<boolean> {
      const modalRef = this.modalService.open(ConfirmDialogComponent, { size: dialogSize, centered: true });
      modalRef.componentInstance.title = title;
      modalRef.componentInstance.message = message;
      modalRef.componentInstance.btnOkText = btnCancelText;
      modalRef.componentInstance.btnCancelText = btnCancelText;
      modalRef.componentInstance.isAcknowledgeOnly = true;
  
      return modalRef.result;
    }
}
