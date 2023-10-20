import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BooknowComponent } from './booknow.component';

const routes: Routes = [
  { path: '', component: BooknowComponent },
  { path: 'booknow/:id', loadChildren: () => import('./detail/detail.module').then(m => m.DetailModule) }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class BooknowRoutingModule { }
