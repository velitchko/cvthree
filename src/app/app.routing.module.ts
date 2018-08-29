import { NgModule }             from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AddComponent } from './components/add.component/add.component';
import { HomeComponent } from './components/home.component/home.component';
import { EditComponent } from './components/edit.component/edit.component';
import { ListComponent } from './components/list.component/list.component';
import { ViewComponent } from './components/view.component/view.component';
import { CompareComponent } from './components/compare.component/compare.component';

const routes: Routes = [
  { path: 'home', component: HomeComponent },
  { path: 'add', component: AddComponent },
  { path: 'edit/:id', component: EditComponent },
  { path: 'list', component: ListComponent },
  { path: 'view/:id', component: ViewComponent },
  { path: 'compare', component: CompareComponent },
  { path: '', redirectTo: '/home', pathMatch: 'full'},
  { path: '**', redirectTo: '/home'},
];

@NgModule({
  imports: [ RouterModule.forRoot(routes) ],
  exports: [ RouterModule ]
})

export class AppRoutingModule {

}
