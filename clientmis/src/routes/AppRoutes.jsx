import {Routes, Route, Navigate} from 'react-router-dom';
import {AppLayout} from '../components/layout/AppLayout';
import {PrivateRoute} from './PrivateRoute';
import {RoleRoute} from './RoleRoute';

// Auth pages
import {LoginPage} from '../pages/auth/LoginPage';
import {RegisterPage} from '../pages/auth/RegisterPage';

// Admin pages
import {AdminDashboard} from '../pages/admin/DashboardPage';
import {UsersPage} from '../pages/admin/UsersPage';
import {UserDetailPage} from '../pages/admin/UserDetailPage';
import {EmployeesPage} from '../pages/admin/EmployeesPage';
import {EmployeeDetailPage} from '../pages/admin/EmployeeDetailPage';
import {ServicesPage} from '../pages/admin/ServicesPage';
import {ServiceDurationsPage} from '../pages/admin/ServiceDurationsPage';
import {SpecialtiesPage} from '../pages/admin/SpecialtiesPage';

// Patient pages
import {PatientHome} from '../pages/patient/HomePage';
import {MyPatientsPage} from '../pages/patient/MyPatientsPage';
import {PatientDetailPage} from '../pages/patient/PatientDetailPage';
import {BookAppointmentPage} from '../pages/patient/BookAppointmentPage';
import {PatientAppointmentsPage} from '../pages/patient/AppointmentsPage';
import {AppointmentDetailPage} from '../pages/patient/AppointmentDetailPage';

// Doctor pages
import {DoctorHome} from '../pages/doctor/HomePage';
import {DoctorSchedulePage} from '../pages/doctor/SchedulePage';
import {DoctorAppointmentsPage} from '../pages/doctor/AppointmentsPage';
import {DoctorAppointmentDetailPage} from '../pages/doctor/AppointmentDetailPage';

// Receptionist pages
import {ReceptionistDashboard} from '../pages/receptionist/DashboardPage';
import {ReceptionistPatientsPage} from '../pages/receptionist/PatientsPage';
import {ReceptionistPatientDetailPage} from '../pages/receptionist/PatientDetailPage';
import {ReceptionistAppointmentsPage} from '../pages/receptionist/AppointmentsPage';
import {ReceptionistAppointmentDetailPage} from '../pages/receptionist/AppointmentDetailPage';
import {CreateAppointmentPage} from '../pages/receptionist/CreateAppointmentPage';
import {SchedulesPage} from '../pages/receptionist/SchedulesPage';
import {ScheduleExceptionsPage} from '../pages/receptionist/ScheduleExceptionsPage';
import {AffectedAppointmentsPage} from '../pages/receptionist/AffectedAppointmentsPage';

// Manager pages
import {AnalyticsPage} from '../pages/manager/AnalyticsPage';

// Unauthorized page
import {UnauthorizedPage} from '../pages/UnauthorizedPage';

export const AppRoutes = () => {
    return (
        <Routes>
            <Route path="/login" element={<LoginPage/>}/>
            <Route path="/register" element={<RegisterPage/>}/>
            <Route path="/unauthorized" element={<UnauthorizedPage/>}/>

            <Route
                element={
                    <PrivateRoute>
                        <AppLayout/>
                    </PrivateRoute>
                }
            >
                <Route
                    path="/admin/dashboard"
                    element={
                        <RoleRoute allowedRoles={['ADMIN']}>
                            <AdminDashboard/>
                        </RoleRoute>
                    }
                />
                <Route
                    path="/admin/users"
                    element={
                        <RoleRoute allowedRoles={['ADMIN']}>
                            <UsersPage/>
                        </RoleRoute>
                    }
                />
                <Route
                    path="/admin/users/:id"
                    element={
                        <RoleRoute allowedRoles={['ADMIN']}>
                            <UserDetailPage/>
                        </RoleRoute>
                    }
                />
                <Route
                    path="/admin/employees"
                    element={
                        <RoleRoute allowedRoles={['ADMIN']}>
                            <EmployeesPage/>
                        </RoleRoute>
                    }
                />
                <Route
                    path="/admin/employees/:id"
                    element={
                        <RoleRoute allowedRoles={['ADMIN']}>
                            <EmployeeDetailPage/>
                        </RoleRoute>
                    }
                />
                <Route
                    path="/admin/services"
                    element={
                        <RoleRoute allowedRoles={['ADMIN']}>
                            <ServicesPage/>
                        </RoleRoute>
                    }
                />
                <Route
                    path="/admin/services/:id/durations"
                    element={
                        <RoleRoute allowedRoles={['ADMIN']}>
                            <ServiceDurationsPage/>
                        </RoleRoute>
                    }
                />
                <Route
                    path="/admin/specialties"
                    element={
                        <RoleRoute allowedRoles={['ADMIN']}>
                            <SpecialtiesPage/>
                        </RoleRoute>
                    }
                />

                <Route
                    path="/patient/home"
                    element={
                        <RoleRoute allowedRoles={['PATIENT']}>
                            <PatientHome/>
                        </RoleRoute>
                    }
                />
                <Route
                    path="/patient/my-patients"
                    element={
                        <RoleRoute allowedRoles={['PATIENT']}>
                            <MyPatientsPage/>
                        </RoleRoute>
                    }
                />
                <Route
                    path="/patient/my-patients/:id"
                    element={
                        <RoleRoute allowedRoles={['PATIENT']}>
                            <PatientDetailPage/>
                        </RoleRoute>
                    }
                />
                <Route
                    path="/patient/book"
                    element={
                        <RoleRoute allowedRoles={['PATIENT']}>
                            <BookAppointmentPage/>
                        </RoleRoute>
                    }
                />
                <Route
                    path="/patient/appointments"
                    element={
                        <RoleRoute allowedRoles={['PATIENT']}>
                            <PatientAppointmentsPage/>
                        </RoleRoute>
                    }
                />
                <Route
                    path="/patient/appointments/:id"
                    element={
                        <RoleRoute allowedRoles={['PATIENT']}>
                            <AppointmentDetailPage/>
                        </RoleRoute>
                    }
                />

                <Route
                    path="/doctor/home"
                    element={
                        <RoleRoute allowedRoles={['DOCTOR']}>
                            <DoctorHome/>
                        </RoleRoute>
                    }
                />
                <Route
                    path="/doctor/schedule"
                    element={
                        <RoleRoute allowedRoles={['DOCTOR']}>
                            <DoctorSchedulePage/>
                        </RoleRoute>
                    }
                />
                <Route
                    path="/doctor/appointments"
                    element={
                        <RoleRoute allowedRoles={['DOCTOR']}>
                            <DoctorAppointmentsPage/>
                        </RoleRoute>
                    }
                />
                <Route
                    path="/doctor/appointments/:id"
                    element={
                        <RoleRoute allowedRoles={['DOCTOR']}>
                            <DoctorAppointmentDetailPage/>
                        </RoleRoute>
                    }
                />

                <Route
                    path="/receptionist/dashboard"
                    element={
                        <RoleRoute allowedRoles={['RECEPTIONIST']}>
                            <ReceptionistDashboard/>
                        </RoleRoute>
                    }
                />
                <Route
                    path="/receptionist/patients"
                    element={
                        <RoleRoute allowedRoles={['RECEPTIONIST']}>
                            <ReceptionistPatientsPage/>
                        </RoleRoute>
                    }
                />
                <Route
                    path="/receptionist/patients/:id"
                    element={
                        <RoleRoute allowedRoles={['RECEPTIONIST']}>
                            <ReceptionistPatientDetailPage/>
                        </RoleRoute>
                    }
                />
                <Route
                    path="/receptionist/appointments"
                    element={
                        <RoleRoute allowedRoles={['RECEPTIONIST']}>
                            <ReceptionistAppointmentsPage/>
                        </RoleRoute>
                    }
                />
                <Route
                    path="/receptionist/appointments/new"
                    element={
                        <RoleRoute allowedRoles={['RECEPTIONIST']}>
                            <CreateAppointmentPage/>
                        </RoleRoute>
                    }
                />
                <Route
                    path="/receptionist/appointments/:id"
                    element={
                        <RoleRoute allowedRoles={['RECEPTIONIST']}>
                            <ReceptionistAppointmentDetailPage/>
                        </RoleRoute>
                    }
                />
                <Route
                    path="/receptionist/schedules"
                    element={
                        <RoleRoute allowedRoles={['RECEPTIONIST']}>
                            <SchedulesPage/>
                        </RoleRoute>
                    }
                />
                <Route
                    path="/receptionist/schedule-exceptions"
                    element={
                        <RoleRoute allowedRoles={['RECEPTIONIST']}>
                            <ScheduleExceptionsPage/>
                        </RoleRoute>
                    }
                />
                <Route
                    path="/receptionist/affected-appointments"
                    element={
                        <RoleRoute allowedRoles={['RECEPTIONIST']}>
                            <AffectedAppointmentsPage/>
                        </RoleRoute>
                    }
                />

                <Route
                    path="/manager/analytics"
                    element={
                        <RoleRoute allowedRoles={['MANAGER']}>
                            <AnalyticsPage/>
                        </RoleRoute>
                    }
                />
            </Route>

            <Route path="/" element={<Navigate to="/login" replace/>}/>
            <Route path="*" element={<Navigate to="/login" replace/>}/>
        </Routes>
    );
};

