import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AddCollectionComponent } from './components/views/add-collection/add-collection.component';
import { AnnotationComponent } from './components/views/annotation/annotation.component';
import { ManageCollectionsComponent } from './components/views/manage-collections/manage-collections.component';
import { ProfileComponent } from './components/views/profile/profile.component';
import { WelcomeComponent } from './components/views/welcome/welcome.component';

 /* Petasis, 18/06/21: ng-matero template: https://github.com/ng-matero/ng-matero */
import { SharedModule } from '@shared/shared.module';
import { AdminLayoutComponent } from './ng-matero/theme/admin-layout/admin-layout.component';
import { DashboardComponent } from './ng-matero/routes/dashboard/dashboard.component';

const COMPONENTS = [];
const COMPONENTS_DYNAMIC = [];

const routes: Routes = [
  {
    path: '',
    component: AdminLayoutComponent,
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: DashboardComponent },
      { path: 'collections/add', component: AddCollectionComponent },
      { path: 'collections/manage', component: ManageCollectionsComponent },
      { path: "annotation", component: AnnotationComponent },
    ],
  }, {
    path: "clarin/welcome", component: WelcomeComponent, data: {
      breadcrumb: 'main'
    },
  },  {
    path: "clarin/profile", component: ProfileComponent, data: {
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
  imports: [SharedModule, RouterModule.forRoot(routes)],
  declarations: [...COMPONENTS, ...COMPONENTS_DYNAMIC],
  entryComponents: COMPONENTS_DYNAMIC,
  exports: [RouterModule]
})
export class AppRoutingModule { }
