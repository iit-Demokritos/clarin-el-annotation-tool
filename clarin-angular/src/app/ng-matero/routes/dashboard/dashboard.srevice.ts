import { Injectable } from '@angular/core';
import { UserService } from 'src/app/services/user-service/user.service';

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
  statistics = [
    {
      title: 'dashboard.Collections',
      amount: '0',
      progress: {
        value: 100,
      },
      color: 'bg-indigo-500',
    },
    {
      title: 'dashboard.Documents',
      amount: '0',
      progress: {
        value: 100,
      },
      color: 'bg-blue-500',
    },
    {
      title: 'dashboard.Annotations',
      amount: '0',
      progress: {
        value: 100,
      },
      color: 'bg-green-500',
    },
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

  getStatistics() {
    let myClonedArray = [];
    this.statistics.forEach(val => myClonedArray.push(Object.assign({}, val)));
    return myClonedArray;
  }

  getSharedStatistics() {
    return this.getStatistics();
  }

  getUnsharedStatistics() {
    return this.getStatistics();
  }

  getUserStatistics() {
    return this.userService.getStats();
  }
}
