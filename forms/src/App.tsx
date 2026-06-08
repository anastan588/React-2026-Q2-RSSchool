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
    <div className="p-8 max-w-6xl mx-auto min-h-screen bg-background text-foreground transition-colors duration-200">
      <header className="mb-8 border-b border-border-custom pb-6">
        <h1 className="text-3xl font-bold tracking-tight">Profile Workspace</h1>
        <p className="text-muted text-sm mt-1">Forms history dashboard</p>
      </header>

      <div className="flex flex-wrap gap-4 mb-8">
        <button
          className="rounded-md bg-primary px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:opacity-90 focus:outline-hidden transition-all active:scale-[0.98] cursor-pointer"
          type="button"
          onClick={() => setActiveModal("uncontrolled")}
        >
          Uncontrolled Form
        </button>

        <button
          className="rounded-md bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-emerald-500 focus:outline-hidden transition-all active:scale-[0.98] cursor-pointer"
          type="button"
          onClick={() => setActiveModal("rhf")}
        >
          React Hook Form
        </button>
      </div>

      <main>
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <span>Submitted Profiles History</span>
          <span className="text-xs bg-accent-soft text-primary px-2.5 py-0.5 rounded-full font-bold border border-border-custom">
            {submissions.length}
          </span>
        </h2>

        {submissions.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {submissions.map((profile, index) => (
              <div
                key={`${profile.email}-${profile.name}-${index}`}
                className="bg-card border border-border-custom rounded-book p-5 shadow-book flex flex-col justify-between backdrop-blur-xs transition-transform hover:translate-y-[-2px] duration-200"
              >
                <div className="flex items-center gap-4 border-b border-border-custom pb-4 mb-4">
                  {profile.image ? (
                    <img
                      alt={`${profile.name}'s profile avatar layout`}
                      className="w-16 h-16 object-cover rounded-full border border-border-custom shadow-inner shrink-0 bg-background"
                      src={profile.image}
                    />
                  ) : (
                    <div className="w-16 h-16 bg-accent-soft rounded-full flex items-center justify-center text-primary font-bold shrink-0 border border-border-custom">
                      {profile.name
                        ? profile.name.substring(0, 2).toUpperCase()
                        : "N/A"}
                    </div>
                  )}
                  <div className="overflow-hidden">
                    <h3 className="font-bold truncate text-base">
                      {profile.name}
                    </h3>
                    <p className="text-xs text-muted truncate">
                      {profile.email}
                    </p>
                  </div>
                </div>

                <div className="space-y-2.5 text-xs">
                  <p className="flex justify-between border-b border-border-custom/30 pb-1">
                    <strong className="text-muted font-medium">
                      Age Metric:
                    </strong>
                    <span className="font-semibold">{profile.age}</span>
                  </p>
                  <p className="flex justify-between border-b border-border-custom/30 pb-1">
                    <strong className="text-muted font-medium">
                      Selected Gender:
                    </strong>{" "}
                    <span className="capitalize font-semibold">
                      {profile.gender}
                    </span>
                  </p>
                  <p className="flex justify-between border-b border-border-custom/30 pb-1">
                    <strong className="text-muted font-medium">
                      Target Country:
                    </strong>
                    <span className="font-semibold">{profile.country}</span>
                  </p>
                  <p className="flex justify-between pt-0.5">
                    <strong className="text-muted font-medium">
                      Terms Status:
                    </strong>{" "}
                    <span className="text-emerald-500 font-semibold flex items-center gap-1">
                      Accepted ✓
                    </span>
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-card border border-border-custom rounded-book p-10 text-center shadow-book backdrop-blur-xs">
            <p className="text-sm text-muted italic">
              No configuration profiles submitted yet. Open a modal form to add
              entries.
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
