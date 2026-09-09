import TextArea from "@/app/components/TextArea";

export default function AskPage() {
  return (
    <div className="flex h-full flex-col flex-1">
      {/* Chat content */}
      <div className="flex-1 overflow-y-auto">
        {/* Messages will go here */}
      </div>

      <TextArea />
    </div>
  );
}
