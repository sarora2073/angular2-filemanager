# Angular2 Filemanager

Credits: Forked from qjon/angular2-filemanager

Purpose: Simple angular file manager that provides a directory tree and files, without preview / crop functionality in original source.

## Installation

Install npm package

    npm i @sarora2073/angular2-filemanager

## Usage
  
In your project put this line
  
    <filemanager  [multiSelection]="isMultiSelection" (onSingleFileSelect)="selectFile($event)">Loading...</filemanager>

## Override API

To override endpoints to manage files and directories provide special provider in you module

    @NgModule({
        ...
        providers: [
            ...
            {
                provide: 'fileManagerUrls',
                useValue: {foldersUrl: '/api/filemanager/folder', filesUrl: '/api/filemanager/file'}
            }
        ]
        ...
    })

## Demo

To run demo you have to serve frontend and backend. To do this run:

* frontend:
    
        npm start
    
* backend

        npm run backend

## TODO
