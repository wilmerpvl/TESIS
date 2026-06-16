import Sidebar from "../components/Sidebar";
import { Outlet } from "react-router-dom";

function DashboardLayout() {

    return (

        <div className="container">

            <Sidebar />

            <div className="content">

                <Outlet />

            </div>

        </div>

    );

}

export default DashboardLayout;