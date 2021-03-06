import {Component, OnInit, Input, Output, EventEmitter, ViewChild} from '@angular/core';
import {environment} from 'src/environments/environment';
import {TaskSomeone} from 'src/app/_models/TaskSomeone';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {AlertifyService} from 'src/app/_services/alertify.service';
import {TaskSomeoneService} from 'src/app/_services/task-someone.service';
import {Media} from 'src/app/_models/Media';
import {MediaUploadComponent} from 'src/app/media/media-upload/media-upload.component';
import {BsDatepickerConfig} from 'ngx-bootstrap';
import {FrequencyEnum} from '../../_models/FrequencyEnum';
import {SelectableOptions} from '../../_interfaces/SelectableOption';
import {DateUtils} from '../../_utils/DateUtils';
import { TaskState } from 'src/app/_models/TaskState';

@Component({
    selector: 'app-edit-task',
    templateUrl: './edit-task.component.html',
    styleUrls: ['./edit-task.component.css']
})
export class EditTaskComponent implements OnInit {
    @Input() task: TaskSomeone;

    @Output() saveSuccessfully = new EventEmitter<any>();
    @Output() cancelChanges = new EventEmitter();

    @ViewChild(MediaUploadComponent) mediaUploadComponent: MediaUploadComponent;

    baseUrl = environment.apiUrl;
    authToken = 'Bearer ' + localStorage.getItem('token');

    editTaskForm: FormGroup;
    attachments: Array<Media> = [];
    toBeDeletedMediaIds: Array<number>;
    uploaderUrl: string;
    waitForMediaUpload: boolean;
    bsConfig: Partial<BsDatepickerConfig>;

    frequencyOptions: SelectableOptions[] = [];

    constructor(private alertify: AlertifyService, private fb: FormBuilder, private taskSomeoneServive: TaskSomeoneService) {
    }

    ngOnInit() {
        this.bsConfig = {
            containerClass: 'theme-blue',
            dateInputFormat: 'DD/MM/YYYY'
        };
        this.createEditTaskForm();
        this.attachments = this.task.mediaList.slice();
        this.toBeDeletedMediaIds = Array<number>();
        this.uploaderUrl = this.baseUrl + 'logged/tasksomeone/' + this.task.id + '/addMedia/';

        this.initSelectableOptions();
    }

    initSelectableOptions() {
        this.frequencyOptions.push({
            label: 'None',
            value: ''
        });
        for (const frequencyEnumItem in FrequencyEnum) {
            this.frequencyOptions.push({
                label: frequencyEnumItem,
                value: FrequencyEnum[frequencyEnumItem]
            });
        }
    }

    createEditTaskForm() {
        this.editTaskForm = this.fb.group({
            id: [''],
            title: ['', Validators.required],
            description: ['', [Validators.required, Validators.minLength(1), Validators.maxLength(1000)]],
            location: ['', Validators.required],
            user: [''],
            createdOn: [''],
            repeat: [this.task.frequency != null],
            frequency: [''],
            startDate: [new Date()],
            endDate: [],
            state: [this.task.state],
            alreadyStartedTask: [this.task.state >= TaskState.STARTED],
            isSubTask: [this.task.isSubTask]
        }, {validator: this.checkRepeatRequiredFieldMatchValidator});

        if(this.task.startDate != null){
            this.task.startDate = DateUtils.convertStringToDate(this.task.startDate + '');
        } else {
            //set start date only if it's a parent task
            if(!this.task.isSubTask){
                this.task.startDate = new Date();
            }
        }
        this.task.endDate = DateUtils.convertStringToDate(this.task.endDate + '');
        // placing the value on the form
        this.editTaskForm.patchValue(this.task);

    }

    checkRepeatRequiredFieldMatchValidator(g: FormGroup) {
        const errorReturn = {};
        if (g.get('repeat').value) {
            if (g.get('frequency').touched && g.get('frequency').value == null) {
                errorReturn['frequencyMiss'] = true;
            }
            if (g.get('startDate').touched && g.get('startDate').value == null) {
                errorReturn['startDateMiss'] = true;
            }
        }

        if (g.get('endDate').touched && g.get('endDate').value == null) {
            errorReturn['endDateMiss'] = true;
        }
        return errorReturn;
    }

    onSaveChanges() {
        if (this.editTaskForm.valid) {

            // we just get  insithe this if statment if we are not in a uploading process
            if (!this.mediaUploadComponent.uploader.isUploading && this.mediaUploadComponent.uploader.queue.length > 0) {
                this.mediaUploadComponent.uploadAllMedia();
                this.waitForMediaUpload = true;

                // when we have things to upload, we return now because the function mediaUploadedSuccessfully()
                // will call this method again, but now we will be updaping the media, so we will pass through
                // this if statment.
                return;
            }

            this.taskSomeoneServive.updateTaskSomeone(this.editTaskForm.value).subscribe((data: any) => {

                    // if there is any file to be deleted we call the service, and inside it, we call the
                    // saveSuccessfullyEvent().
                    if (this.toBeDeletedMediaIds.length > 0) {
                        this.taskSomeoneServive.removeMediaFromTaskSomeone(this.toBeDeletedMediaIds, this.task.id).subscribe((res: any) => {
                            this.saveSuccessfullyEvent(res);
                        });
                    } else {
                        this.saveSuccessfullyEvent(data);
                    }

                }, error => {
                    this.alertify.error(error.subErrors[0].message);
                }
            );

        }
    }

    onCancelChanges() {
        this.cancelChanges.emit();
    }

    removeMediaFromTaskMedia(media) {
        this.toBeDeletedMediaIds.push(media.id);
        this.attachments.splice(this.attachments.indexOf(media), 1);
        console.log(this.toBeDeletedMediaIds);
    }

    mediaUploadedSuccessfully(data: any) {
        this.waitForMediaUpload = false;
        this.task = data;

        this.onSaveChanges();
    }

    saveSuccessfullyEvent(data: any) {
        this.alertify.success('Task successfully changed');
        this.saveSuccessfully.emit(data);
    }

    getCurrentStateDescription(stateCode: number) {
        return this.taskSomeoneServive.getCurrentStateDescription(stateCode);
    }
    getStateClass(stateCode: number, outline: boolean = false) {
        return this.taskSomeoneServive.getStateClass(stateCode, outline);
    }
}
