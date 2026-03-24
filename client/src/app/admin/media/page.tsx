"use client";

import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Image as ImageIcon, Film, FolderOpen } from "lucide-react";
import { useState } from "react";
import MediaTable from "./components/media-table";
import MediaUploadDialog from "./components/media-upload-dialog";
import { MediaType } from "@/types/media";

export default function MediaPage() {
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"all" | "images" | "videos">(
    "all"
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Media Library</h1>
          <p className="text-muted-foreground">
            Upload and manage images and videos. Videos are automatically
            processed to HLS format for streaming.
          </p>
        </div>
        <Button onClick={() => setUploadDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Upload Media
        </Button>
      </div>

      {/* Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={(v) => setActiveTab(v as typeof activeTab)}
      >
        <TabsList>
          <TabsTrigger value="all" className="flex items-center gap-2">
            <FolderOpen className="h-4 w-4" />
            All
          </TabsTrigger>
          <TabsTrigger value="images" className="flex items-center gap-2">
            <ImageIcon className="h-4 w-4" />
            Images
          </TabsTrigger>
          <TabsTrigger value="videos" className="flex items-center gap-2">
            <Film className="h-4 w-4" />
            Videos
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-4">
          <MediaTable typeFilter={undefined} />
        </TabsContent>

        <TabsContent value="images" className="mt-4">
          <MediaTable typeFilter={MediaType.IMAGE} />
        </TabsContent>

        <TabsContent value="videos" className="mt-4">
          <MediaTable typeFilter={MediaType.VIDEO} />
        </TabsContent>
      </Tabs>

      {/* Upload Dialog */}
      <MediaUploadDialog
        open={uploadDialogOpen}
        onOpenChange={setUploadDialogOpen}
      />
    </div>
  );
}
