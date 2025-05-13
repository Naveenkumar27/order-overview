/**
 * PresetManager Component
 * Handles the creation, loading, and deletion of filter/sort presets.
 * Presets are persisted using localStorage and managed through a modal UI.
 */

"use client";

import {
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
  ModalFooter,
  Button,
  Input,
  Tooltip,
} from "@heroui/react";
import { useEffect, useState, Dispatch, SetStateAction } from "react";
import { FilterState, Preset } from "@/types/filters";
import { SortableOrderKeys } from "@/app/page";


interface Props {
  filters: FilterState;
  sortKey: string;
  sortDirection: "asc" | "desc";
  setFilters: (filters: FilterState) => void;
  setSortKey: Dispatch<SetStateAction<SortableOrderKeys>>;
  setSortDirection: (dir: "asc" | "desc") => void;
  setActivePresetName: (name: string | null) => void;
}


export default function PresetManager({
  filters,
  sortKey,
  sortDirection,
  setFilters,
  setSortKey,
  setSortDirection,
  setActivePresetName,
}: Props) {
  const [open, setOpen] = useState(false); // modal visibility
  const [name, setName] = useState(""); // current input name for preset
  const [presets, setPresets] = useState<Preset[]>([]); // stored presets

  // Load presets from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("order-presets");
    if (saved) setPresets(JSON.parse(saved));
  }, []);

  // Save or overwrite a preset
  const savePreset = () => {
    if (!name.trim()) return;
    const newPreset: Preset = {
      name,
      filters,
      sortKey: sortKey as SortableOrderKeys,
      sortDirection,
    };
    const updated = [...presets.filter((p) => p.name !== name), newPreset];
    setPresets(updated);
    localStorage.setItem("order-presets", JSON.stringify(updated));
    setName("");
  };

  // Load preset settings into current state 
  const loadPreset = (preset: Preset) => {
    setFilters(preset.filters);
    setSortKey(preset.sortKey);
    setSortDirection(preset.sortDirection);
    setActivePresetName(preset.name);
    localStorage.setItem("active-order-preset", preset.name);
    setOpen(false);
  };

  // Delete a preset and update state
  const deletePreset = (name: string) => {
    const updated = presets.filter((p) => p.name !== name);
    setPresets(updated);
    localStorage.setItem("order-presets", JSON.stringify(updated));

    const active = localStorage.getItem("active-order-preset");
    if (active === name) {
      localStorage.removeItem("active-order-preset");
      setActivePresetName(null);
    }
  };

  return (
    <>
      {/* Tooltip Button Trigger */}
      <Tooltip
        content="Save, load, or delete a filter configuration"
        placement="right-start"
        color="foreground"
        delay={1000}
      >
        <Button
          onPress={() => setOpen(true)}
          variant="flat"
          color="default"
          size="md"
          className="font-semibold"
        >
          Manage Presets
        </Button>
      </Tooltip>

      {/* Preset Modal */}
      <Modal isOpen={open} onOpenChange={setOpen} size="md">
        <ModalContent>
          <ModalHeader>Manage Presets</ModalHeader>
          <ModalBody>
            {/* Preset Name Input */}
            <Input
              label="Preset Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Urgent Orders"
            />

            {/* Save Button */}
            <Button
              color="primary"
              onPress={savePreset}
              disabled={!name.trim()}
              className="mt-2"
            >
              Save Current Filters
            </Button>

            {/* Preset List */}
            <div className="mt-4 space-y-2">
              {presets.length === 0 ? (
                <p className="text-sm text-gray-500">No presets saved yet.</p>
              ) : (
                presets.map((p) => (
                  <div
                    key={p.name}
                    className="flex justify-between items-center text-sm border p-2 rounded"
                  >
                    <span>{p.name}</span>
                    <div className="space-x-2">
                      <Button
                        size="sm"
                        onPress={() => loadPreset(p)}
                        variant="flat"
                      >
                        Load
                      </Button>
                      <Button
                        size="sm"
                        onPress={() => deletePreset(p.name)}
                        variant="light"
                        color="danger"
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </ModalBody>

          {/* Modal Footer */}
          <ModalFooter>
            <Button onPress={() => setOpen(false)} color="default" size="md">
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}