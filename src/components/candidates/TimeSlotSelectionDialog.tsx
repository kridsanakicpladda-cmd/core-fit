import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { CalendarIcon, Clock, X, Check } from "lucide-react";
import { format } from "date-fns";
import { th } from "date-fns/locale";
import { cn } from "@/lib/utils";

interface TimeSlot {
  date: Date;
  time: string;
}

interface TimeSlotSelectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  candidateName: string;
  onConfirm: (slots: TimeSlot[]) => void;
}

const timeOptions = [
  "09:00 - 10:00",
  "10:00 - 11:00",
  "11:00 - 12:00",
  "13:00 - 14:00",
  "14:00 - 15:00",
  "15:00 - 16:00",
  "16:00 - 17:00",
];

export function TimeSlotSelectionDialog({
  open,
  onOpenChange,
  candidateName,
  onConfirm,
}: TimeSlotSelectionDialogProps) {
  const [selectedSlots, setSelectedSlots] = useState<TimeSlot[]>([]);
  const [currentDate, setCurrentDate] = useState<Date | undefined>();
  const [currentTime, setCurrentTime] = useState<string>("");

  const addSlot = () => {
    if (currentDate && currentTime && selectedSlots.length < 3) {
      const newSlot = { date: currentDate, time: currentTime };
      // Check for duplicates
      const isDuplicate = selectedSlots.some(
        (slot) =>
          slot.date.toDateString() === newSlot.date.toDateString() &&
          slot.time === newSlot.time
      );
      if (!isDuplicate) {
        setSelectedSlots([...selectedSlots, newSlot]);
        setCurrentTime("");
      }
    }
  };

  const removeSlot = (index: number) => {
    setSelectedSlots(selectedSlots.filter((_, i) => i !== index));
  };

  const handleConfirm = () => {
    if (selectedSlots.length === 3) {
      onConfirm(selectedSlots);
      setSelectedSlots([]);
      setCurrentDate(undefined);
      setCurrentTime("");
      onOpenChange(false);
    }
  };

  const handleClose = () => {
    setSelectedSlots([]);
    setCurrentDate(undefined);
    setCurrentTime("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl">เลือก Slot เวลาสัมภาษณ์</DialogTitle>
          <p className="text-sm text-muted-foreground mt-1">
            เลือก 3 ช่วงเวลาสำหรับ <span className="font-medium text-foreground">{candidateName}</span>
          </p>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Selected Slots */}
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Slot ที่เลือก ({selectedSlots.length}/3)
            </label>
            <div className="flex flex-wrap gap-2">
              {selectedSlots.map((slot, index) => (
                <Badge
                  key={index}
                  variant="secondary"
                  className="px-3 py-2 text-sm flex items-center gap-2"
                >
                  <span>
                    {format(slot.date, "d MMM", { locale: th })} {slot.time}
                  </span>
                  <button
                    onClick={() => removeSlot(index)}
                    className="hover:text-destructive transition-colors"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
              {selectedSlots.length === 0 && (
                <p className="text-sm text-muted-foreground">ยังไม่ได้เลือก slot</p>
              )}
            </div>
          </div>

          {/* Date & Time Selection */}
          {selectedSlots.length < 3 && (
            <div className="space-y-4 p-4 border rounded-lg bg-muted/20">
              <div className="space-y-2">
                <label className="text-sm font-medium">เลือกวันที่</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !currentDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {currentDate ? (
                        format(currentDate, "PPP", { locale: th })
                      ) : (
                        <span>เลือกวันที่</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={currentDate}
                      onSelect={setCurrentDate}
                      disabled={(date) => date < new Date()}
                      initialFocus
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">เลือกเวลา</label>
                <div className="grid grid-cols-2 gap-2">
                  {timeOptions.map((time) => (
                    <Button
                      key={time}
                      variant={currentTime === time ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentTime(time)}
                      className="justify-start"
                    >
                      <Clock className="h-3 w-3 mr-2" />
                      {time}
                    </Button>
                  ))}
                </div>
              </div>

              <Button
                onClick={addSlot}
                disabled={!currentDate || !currentTime}
                className="w-full"
                size="sm"
              >
                เพิ่ม Slot
              </Button>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            ยกเลิก
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={selectedSlots.length !== 3}
            className="gap-2"
          >
            <Check className="h-4 w-4" />
            ยืนยัน ({selectedSlots.length}/3)
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
