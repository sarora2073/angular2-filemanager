import {IContextMenu} from "@rign/angular2-tree/main";
import {Injectable, Inject} from "@angular/core";
import {IFileTypeFilter} from "../toolbar/interface/IFileTypeFilter";
import {IUrlConfiguration} from "./IUrlConfiguration";

@Injectable()
export class FileManagerConfiguration {
  public contextMenuItems: IContextMenu[] = [];

  public isMultiSelection: boolean = false;

  public fileUrl: string = '/api/files';

  constructor(@Inject('fileManagerUrls') urls: IUrlConfiguration) {

    this.fileUrl = urls.filesUrl;
  }
}
