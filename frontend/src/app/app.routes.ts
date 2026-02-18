import { Routes } from '@angular/router';
import { Register } from './auth/register/register';
import { LoginComponent } from './auth/login/login.component';
import { PostsComponent } from './posts/posts.component';
import { ProfileComponent } from './profile/profile.component';
import { NotificationsComponent } from './notifications/notifications.component';
import { PostDetailComponent } from './posts/post-detail.component';
import { ExploreComponent } from './explore/explore.component';
import { AdminComponent } from './admin/admin.component';
import { AdminDashboardComponent } from './admin/dashboard.component';
import { SettingsComponent } from './settings/settings.component';
import { authGuard } from './core/guards/auth.guard';
import { adminGuard } from './core/guards/admin.guard';
import { ErrorPage } from './core/components/error-page/error-page';

export const routes: Routes = [
    { path: 'login', component: LoginComponent },
    { path: 'register', component: Register },
    { path: 'error/404', component: ErrorPage, data: { type: '404' } },
    { path: 'error/500', component: ErrorPage, data: { type: '500' } },
    { path: 'error/403', component: ErrorPage, data: { type: '403' } },
    { path: 'posts', component: PostsComponent, canActivate: [authGuard] },
    { path: 'posts/:id', component: PostDetailComponent, canActivate: [authGuard] },
    { path: 'explore', component: ExploreComponent, canActivate: [authGuard] },
    { path: 'profile', component: ProfileComponent, canActivate: [authGuard] },
    { path: 'profile/:username', component: ProfileComponent, canActivate: [authGuard] },
    { path: 'notifications', component: NotificationsComponent, canActivate: [authGuard] },
    {
        path: 'admin',
        component: AdminComponent,
        canActivate: [authGuard, adminGuard],
        children: [
            { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
            { path: 'dashboard', component: AdminDashboardComponent }
        ]
    },
    { path: 'settings', component: SettingsComponent, canActivate: [authGuard] },
    { path: '', redirectTo: 'login', pathMatch: 'full' },
    { path: '**', redirectTo: 'error/404' }
];
