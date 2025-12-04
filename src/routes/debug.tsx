import { createFileRoute } from '@tanstack/react-router';
import { Button, Code } from '@mantine/core';
import { useState } from 'react';
import { BaseDirectory } from '@tauri-apps/api/path';
import { readDir, readTextFile } from '@tauri-apps/plugin-fs';
import { FlexCol } from '@/components/Layout/FlexCol.tsx';

const RouteComponent = () => {
  const [debugText, setDebugText] = useState<string>('');

  const list = async () => {
    setDebugText(JSON.stringify(await readDir('.', { baseDir: BaseDirectory.AppData }), null, 2));
  };

  const read = async () => {
    setDebugText(JSON.stringify(JSON.parse(await readTextFile('games.json', { baseDir: BaseDirectory.AppData })), null, 2));
  };

  return (
    <FlexCol fullWidth>
      <Code block>{debugText}</Code>
      <Button onClick={list}>List Files</Button>
      <Button onClick={read}>Read state file</Button>
    </FlexCol>
  );
};

export const Route = createFileRoute('/debug')({
  component: RouteComponent,
});
