import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AuthGuard } from './auth/auth.guard';
import { AdminGuard } from './auth/admin.guard';

import { HomeComponent } from './pages/home/home.component';
import { CallbackComponent } from './pages/callback/callback.component';
import { MyRsvpsComponent } from './pages/my-rsvps/my-rsvps.component';

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
        path: 'event/:id',
        loadChildren: './pages/event/event.module#EventModule',
        canActivate: [AuthGuard],
    },
    {
        path: 'my-rsvps',
        component: MyRsvpsComponent,
        canActivate: [AuthGuard],
    },
    {
        path: 'admin',
        loadChildren: './pages/admin/admin.module#AdminModule',
        canActivate: [
            AuthGuard,
            AdminGuard,
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
