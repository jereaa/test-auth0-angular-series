import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AuthGuard } from './auth/auth.guard';
import { AdminGuard } from './auth/admin.guard';

import { HomeComponent } from './pages/home/home.component';
import { CallbackComponent } from './pages/callback/callback.component';
import { AdminComponent } from './pages/admin/admin.component';

const routes: Routes = [
    {
        path: '',
        component: HomeComponent,
        children: [],
    },
    {
        path: 'callback',
        component: CallbackComponent,
    },
    {
        path: 'admin',
        canActivate: [
            AuthGuard,
            AdminGuard,
        ],
        children: [
            { path: '', component: AdminComponent },
        ],
    },
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    providers: [
        AuthGuard,
        AdminGuard,
    ],
    exports: [RouterModule],
})
export class AppRoutingModule { }
