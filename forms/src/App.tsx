import { useState } from "react";

import { Modal } from "@/components/Modal";
import { UnifiedForm } from "@/components/UnifiedForm";
import { addSubmission } from "@/store/profileSlice";
import { useAppDispatch, useAppSelector } from "@/store/store";
import { type FormValues } from "@/utils/ValidationSchema";

type ModalType = "uncontrolled" | "rhf" | null;

export const App = () => {
  const [activeModal, setActiveModal] = useState<ModalType>(null);

  const dispatch = useAppDispatch();
  const submissions = useAppSelector((state) => state.profile.submissions);

  const handleFormSubmission = (data: FormValues) => {
    dispatch(addSubmission(data));
    setActiveModal(null);
  };

  return (
    <div className="p-8 max-w-6xl mx-auto min-h-screen bg-gray-50">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-950">Profile Workspace</h1>
        <p className="text-gray-500 text-sm mt-1">
          Redux Toolkit state management history dashboard
        </p>
      </header>

      <div className="flex gap-4 mb-8">
        <button
          className="rounded-md bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus:outline-none transition-colors"
          type="button"
          onClick={() => setActiveModal("uncontrolled")}
        >
          Open Uncontrolled Form
        </button>

        <button
          className="rounded-md bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-emerald-500 focus:outline-none transition-colors"
          type="button"
          onClick={() => setActiveModal("rhf")}
        >
          Open React Hook Form
        </button>
      </div>

      <main>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Submitted Profiles History ({submissions.length})
        </h2>

        {submissions.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {submissions.map((profile, index) => (
              <div
                key={`${profile.email}-${profile.name}-${index}`}
                className="bg-white border rounded-xl p-5 shadow-sm flex flex-col justify-between"
              >
                <div className="flex items-center gap-4 border-b border-gray-100 pb-4 mb-4">
                  {profile.image ? (
                    <img
                      alt={`${profile.name}'s profile avatar layout`}
                      className="w-16 h-16 object-cover rounded-full border shadow-inner shrink-0"
                      src={profile.image}
                    />
                  ) : (
                    <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center text-gray-400 font-semibold shrink-0">
                      N/A
                    </div>
                  )}
                  <div className="overflow-hidden">
                    <h3 className="font-bold text-gray-950 truncate">
                      {profile.name}
                    </h3>
                    <p className="text-xs text-gray-500 truncate">
                      {profile.email}
                    </p>
                  </div>
                </div>

                <div className="space-y-2 text-xs text-gray-600">
                  <p>
                    <strong>Age Metric:</strong> {profile.age}
                  </p>
                  <p>
                    <strong>Selected Gender:</strong>{" "}
                    <span className="capitalize">{profile.gender}</span>
                  </p>
                  <p>
                    <strong>Target Country:</strong> {profile.country}
                  </p>
                  <p>
                    <strong>Terms Status:</strong>{" "}
                    <span className="text-emerald-600 font-semibold">
                      Accepted ✓
                    </span>
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white border rounded-xl p-8 text-center shadow-sm">
            <p className="text-sm text-gray-400 italic">
              No configuration profiles submitted to the Redux store yet. Open a
              modal form to add entries.
            </p>
          </div>
        )}
      </main>

      <Modal
        isOpen={activeModal !== null}
        title={
          activeModal === "rhf"
            ? "React Hook Form Implementation"
            : "Uncontrolled Implementation"
        }
        onClose={() => setActiveModal(null)}
      >
        {activeModal ? (
          <UnifiedForm
            type={activeModal}
            onSubmitSuccess={handleFormSubmission}
          />
        ) : null}
      </Modal>
    </div>
  );
};

export default App;
