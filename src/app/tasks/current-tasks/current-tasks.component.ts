import {Component, OnInit} from '@angular/core';
import {TaskSomeoneDetailsDTO} from '../../_models/TaskSomeoneDetailsDTO';
import {TaskSomeoneService} from '../../_services/task-someone.service';
import {AlertifyService} from '../../_services/alertify.service';
import {Pageable} from 'src/app/_models/Pageable';
import {PaginationInfo} from 'src/app/_models/PaginationInfo';
import {ActivatedRoute} from '@angular/router';


@Component({
    selector: 'app-current-tasks',
    templateUrl: './current-tasks.component.html',
    styleUrls: ['./current-tasks.component.css']
})
export class CurrentTasksComponent implements OnInit {
    currentTasks: TaskSomeoneDetailsDTO[];

    constructor(private taskSomeoneService: TaskSomeoneService, private alertify: AlertifyService, private route: ActivatedRoute) {
    }

    paginationInfo: PaginationInfo;


    ngOnInit() {
        this.route.data.subscribe(data => {
            this.currentTasks = data['currentTasksList'].content;
            this.paginationInfo = new PaginationInfo(data['currentTasksList']);
        });
    }

    listWithPagination(pageable: Pageable) {
        this.taskSomeoneService.listCurrentUserTasks(pageable).subscribe((page: any[]) => {
            this.currentTasks = page['content'];
            this.paginationInfo = new PaginationInfo(page);
        }, error => {
            this.alertify.error(error.message);
        });
    }

    getRiskClass(task: TaskSomeoneDetailsDTO) {
        return this.taskSomeoneService.getPunctualTaskRisk(task);
    }

}
