import RolesList from "../../components/roles-permission/RolesList";
import ModuleList from "../../components/roles-permission/ModuleList";

const RolesPermissionPage = () => {
  return (
    <>
      {/* Roles & Permission Listing */}
      <div className="grid grid-cols-5 gap-8">
        <div className="col-span-5 xl:col-span-2">
          <RolesList />
        </div>

        <div className="col-span-5 xl:col-span-3">
          <ModuleList />
        </div>
      </div>
    </>
  );
};

export default RolesPermissionPage;
