import { Component, EventEmitter, Output, ChangeDetectorRef } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { UploadEvent, UploadFile, FileSystemFileEntry, FileSystemDirectoryEntry } from 'ngx-file-drop';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-file-upload',
  templateUrl: './file.upload.component.html',
  styleUrls: ['file.upload.component.scss']
})
export class FileUploadComponent {
  @Output() uploadedFilePaths: EventEmitter<string>;
  public files: Array<UploadFile>;
  uploading: boolean = false;

  constructor(private http: HttpClient, private cd: ChangeDetectorRef) {
    this.files = new Array<UploadFile>();
    this.uploadedFilePaths = new EventEmitter<string>();
  }

  public dropped(event: UploadEvent): void {
     this.files = event.files;
     this.uploading = true;
     for(const droppedFile of event.files) {

       // Is it a file?
       if (droppedFile.fileEntry.isFile) {
         const fileEntry = droppedFile.fileEntry as FileSystemFileEntry;
         fileEntry.file((file: File) => {

           // Here you can access the real file
          // console.log(droppedFile.relativePath, file);


           // You could upload it like this:
           const formData = new FormData()

           formData.append('file', file, droppedFile.relativePath);

           this.http.post(`${environment.API_PATH}uploads`, formData)
           .subscribe( (success: any) => {
             // Sanitized logo returned from backend
            setTimeout(() => {
              this.uploading = false;
              this.uploadedFilePaths.emit(success.path);
              this.cd.detectChanges();
            }, 2500);
           });
         });
       } else {
         // It was a directory (empty directories are added, otherwise only files)
         const fileEntry = droppedFile.fileEntry as FileSystemDirectoryEntry;
        //  console.log(droppedFile.relativePath, fileEntry);
       }
     }
   }


  public fileOver(event: any): void {
    // console.log(event);
  }

  public fileLeave(event: any): void {
    // console.log(event);
  }
}
