import { Routes, RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { AddCollectionComponent } from './components/views/add-collection/add-collection.component';
import { AnnotationComponent } from './components/views/annotation/annotation.component';
import { ManageCollectionsComponent } from './components/views/manage-collections/manage-collections.component';
import { ProfileComponent } from './components/views/profile/profile.component';
import { WelcomeComponent } from './components/views/welcome/welcome.component';

 /* Petasis, 18/06/21: ng-matero template: https://github.com/ng-matero/ng-matero */
import { SharedModule }           from '@shared/shared.module';
import { AdminLayoutComponent }   from './ng-matero/theme/admin-layout/admin-layout.component';
import { AuthLayoutComponent }    from './ng-matero/theme/auth-layout/auth-layout.component';
import { DashboardComponent }     from './ng-matero/routes/dashboard/dashboard.component';
//import { LoginComponent }         from './ng-matero/routes/sessions/login/login.component';
import { AuthLayoutModComponent } from './components/views/auth-layout-mod/auth-layout-mod.component';
import { LoginComponent }         from './components/views/login/login.component';
import { RegisterComponent }      from './components/views/register/register.component';
import { AuthGuard }              from '@core';

const COMPONENTS = [];
const COMPONENTS_DYNAMIC = [];

/*
 * The entries shown in the sidebar, are defined in file:
 *   src/assets/data/menu.json
 */
const routes: Routes = [
  { path: '', redirectTo: '/auth/login', pathMatch: 'full' },
  {
    path: 'app',
    component: AdminLayoutComponent,
    canActivate: [AuthGuard],
    canActivateChild: [AuthGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard',          component: DashboardComponent },
      { path: 'collections/add',    component: AddCollectionComponent },
      { path: 'collections/manage', component: ManageCollectionsComponent },
      { path: "annotation",         component: AnnotationComponent },
    ],
  },
  {
    path: 'auth',
    component: AuthLayoutModComponent,
    children: [
      { path: 'login',    component: LoginComponent },
      { path: 'register', component: RegisterComponent },
    ],
  },
  { path: 'profile/overview', redirectTo: 'app/profile/overview' },
  { path: 'profile/settings', redirectTo: 'app/profile/settings' },
  { path: '**', redirectTo: '/auth/login' },
  /*{ path: "auth/login", component: WelcomeComponent },
 
  {
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
  }*/
];

@NgModule({
  imports: [SharedModule, RouterModule.forRoot(routes, { relativeLinkResolution: 'legacy' })],
  declarations: [...COMPONENTS, ...COMPONENTS_DYNAMIC],
  entryComponents: COMPONENTS_DYNAMIC,
  exports: [RouterModule]
})
export class AppRoutingModule { }
