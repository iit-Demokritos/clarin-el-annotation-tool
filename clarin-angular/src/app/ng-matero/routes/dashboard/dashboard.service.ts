import { Injectable } from '@angular/core';
import { UserService } from 'src/app/services/user-service/user.service';
import { cloneDeep } from "lodash";

const MESSAGES = [
  {
    img: 'assets/images/avatars/avatar-1.jpg',
    subject: 'Hydrogen',
    content: `Cras sit amet nibh libero, in gravida nulla.
     Nulla vel metus scelerisque ante sollicitudin commodo.`,
  },
  {
    img: 'assets/images/avatars/avatar-2.jpg',
    subject: 'Helium',
    content: `Cras sit amet nibh libero, in gravida nulla.
     Nulla vel metus scelerisque ante sollicitudin commodo.`,
  },
  {
    img: 'assets/images/avatars/avatar-3.jpg',
    subject: 'Lithium',
    content: `Cras sit amet nibh libero, in gravida nulla.
     Nulla vel metus scelerisque ante sollicitudin commodo.`,
  },
  {
    img: 'assets/images/avatars/avatar-4.jpg',
    subject: 'Beryllium',
    content: `Cras sit amet nibh libero, in gravida nulla.
     Nulla vel metus scelerisque ante sollicitudin commodo.`,
  },
  {
    img: 'assets/images/avatars/avatar-6.jpg',
    subject: 'Boron',
    content: `Cras sit amet nibh libero, in gravida nulla.
     Nulla vel metus scelerisque ante sollicitudin commodo.`,
  },
];

@Injectable()
export class DashboardService {
  item_collections = {
      title: 'dashboard.Collections',
      amount: '⏳',
      progress: {
        value: 100,
      },
      color: 'bg-indigo-500',
      footer: '',
    };
  item_documents = {
      title: 'dashboard.Documents',
      amount: '⏳',
      progress: {
        value: 100,
      },
      color: 'bg-blue-500',
      footer: '',
    };
  item_annotations = {
      title: 'dashboard.Annotations',
      amount: '⏳',
      progress: {
        value: 100,
      },
      color: 'bg-green-500',
      footer: '',
    };
  item_annotations_by_me = {
      title: 'dashboard.AnnotationsByMe',
      amount: '⏳',
      progress: {
        value: 100,
      },
      color: 'bg-light-green-500',
      footer: 'dashboard.AnnotationsCreatedByMe',
    };
  item_collectionsShared = {
      title: 'dashboard.CollectionsShared',
      amount: '⏳',
      progress: {
        value: 0,
      },
      color: 'bg-teal-500',
      footer: 'dashboard.CollectionsSharedByMe'
    };
  
  statistics = [
    this.item_collections,
    this.item_documents,
    this.item_annotations,
    this.item_annotations_by_me,
    this.item_collectionsShared,
  ];

  statistics_shared = [
    this.item_collections,
    this.item_annotations,
  ];

  statistics_unshared = [
    this.item_collections,
    this.item_documents,
    this.item_annotations,
  ];

  statistics_total = [
     this.item_collections,
     this.item_annotations_by_me,
  ];

  charts = [
  ];

  constructor(public userService: UserService) {}

  getMessages() {
    return MESSAGES;
  }

  getCharts() {
    return this.charts;
  }

  cloneArrayObjects(arrayObj) {
    return cloneDeep(arrayObj);
    // let myClonedArray = [];
    // arrayObj.forEach(val => myClonedArray.push(Object.assign({}, val)));
    // return myClonedArray;
  }; /* cloneArrayObjects */

  getStatistics() {
    let val = this.cloneArrayObjects(this.statistics);
    val[0].footer = val[1].footer = '\u00a0';
    val[2].footer = 'dashboard.TotalAnnotations';
    return val;
  }

  getSharedStatistics() {
    return this.cloneArrayObjects(this.statistics_shared);
  }

  getUnsharedStatistics() {
    return this.cloneArrayObjects(this.statistics_unshared);
  }

  getTotalStatistics() {
    let val = this.cloneArrayObjects(this.statistics_total);
    val[0].footer = '\u00a0';
    return val;
  }

  getUserStatistics() {
    return this.userService.getStats();
  }
}
