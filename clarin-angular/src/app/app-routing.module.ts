import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AddCollectionComponent } from './components/views/add-collection/add-collection.component';
import { AnnotationComponent } from './components/views/annotation/annotation.component';
import { ManageCollectionsComponent } from './components/views/manage-collections/manage-collections.component';
import { ProfileComponent } from './components/views/profile/profile.component';
import { WelcomeComponent } from './components/views/welcome/welcome.component';


const routes: Routes = [
  {
    path: "", component: WelcomeComponent, data: {
      breadcrumb: 'main'
    },
  },  {
    path: "app/welcome", component: WelcomeComponent, data: {
      breadcrumb: 'main'
    },
  },  {
    path: "app/profile", component: ProfileComponent, data: {
      breadcrumb: 'main'
    },
  },
  {
    path: "collections/add", component: AddCollectionComponent, data: {
      breadcrumb: 'main'
    },
  },
  {
    path: "collections/manage", component: ManageCollectionsComponent, data: {
      breadcrumb: 'main'
    },
  },
  {
    path: "annotation", component: AnnotationComponent, data: {
      breadcrumb: 'main'
    },
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
