import { Save } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";


interface RolesPermissionFormProps {
  initialData: any;
}

const RolesPermissionForm = ({ initialData }: RolesPermissionFormProps) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState<boolean>(false);

  const [role, setRole] = useState<any>(initialData);

  const handleChange = (
    key: string,
    value: boolean,
    permissionIndex: number
  ) => {
    setRole((oldRole: any) => {
      oldRole["permissions"][permissionIndex][key] = value;
      return oldRole;
    });
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);

    try {
      let response;
      if (role.id) {
        //Update
     //   response = await updateRolePermission(role?.id, role);
        console.log("update role", role);
      } else {
        //Create
        // response = await createRolePermission(role);

        // toast.success("Created", {
        //   autoClose: 2000,
        // });
      }
    } catch (ex: any) {
     // toast.error("Error Occured");
    } finally {
      setLoading(false);
      setRole(initialData);

      //router.push("/dashboard/roles-permission");
    //  router.refresh();
      // Revalidate the path and redirect to the home page
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit}>
        <div className="mx-5 mt-5 flex row gap-5">
          <div className="flex-1">
            <input
              title="Name"
              required
              name="name"
              type="text"
              placeholder="Enter Name"
              defaultValue={role?.name || ""}
              onChange={(value) => {
                setRole({ ...role, name: value.target.value });
              }}
            />
          </div>
          <div className="flex-1">
            <input
              title="Description"
              required
              name="description"
              type="text"
              placeholder="Enter Description"
              defaultValue={role?.description || ""}
              onChange={(value) => {
                setRole({ ...role, description: value.target.value });
              }}
            />
          </div>
          <div className="mt-auto">
            <button
              type="submit"
              className="flex items-center rounded-full bg-primary px-2 py-2 font-medium text-white hover:bg-opacity-90 lg:px-8 xl:px-10"
            >
              Save &nbsp; <Save />
            </button>
          </div>
        </div>

        {/* Modules & Permissions */}

        <div className="border-b border-stroke px-7 py-4 dark:border-strokedark">
          <div className="flex justify-between pb-4">
            <div className="">
              <h3 className="font-medium text-black dark:text-white">
                Modules & Permissions
              </h3>
            </div>

            <div className="flex">
              <div className="px-10">Create</div>
              <div className="px-10">Read</div>
              <div className="px-10">Update</div>
              <div className="px-10">Delete</div>
            </div>
          </div>
        </div>

        {role.permissions.map((mod: any, i: number) => {
          let defaultValue = {
            create: role.permissions[i]["create"],
            read: role.permissions[i]["read"],
            update: role.permissions[i]["update"],
            delete: role.permissions[i]["delete"],
          };

          return (
            <div
              key={i}
              className="border-b border-stroke px-7 py-4 dark:border-strokedark "
            >
              <div className="flex justify-between pb-4">
                <div className="">{mod.appModule.name}</div>

                <div className="flex">
                  <div className="px-10">
                    <input
                      id={`permission[${mod.appModule.name}][create]`}
                      name={`permission[${mod.appModule.name}][create]`}
                      defaultValue={defaultValue.create}
                      type="checkbox"
                      onChange={(v: any) => {
                        handleChange("create", v, i);
                      }}
                    />
                  </div>
                  <div className="px-10">
                    <input
                      id={`permission[${mod.appModule.name}][read]`}
                      name={`permission[${mod.appModule.name}][read]`}
                      defaultValue={defaultValue.read}
                      type="checkbox"
                      onChange={(v: any) => {
                        handleChange("read", v, i);
                      }}
                    />
                  </div>
                  <div className="px-10">
                    <input
                      id={`permission[${mod.appModule.name}][update]`}
                      name={`permission[${mod.appModule.name}][update]`}
                      defaultValue={defaultValue.update}
                      type="checkbox"
                      onChange={(v: any) => {
                        handleChange("update", v, i);
                      }}
                    />
                  </div>
                  <div className="px-10">
                    <input
                      id={`permission[${mod.appModule.name}][delete]`}
                      name={`permission[${mod.appModule.name}][delete]`}
                      defaultValue={defaultValue.delete}
                      type="checkbox"
                      onChange={(v: any) => {
                        handleChange("delete", v, i);
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </form>
    </>
  );
};

export default RolesPermissionForm;
