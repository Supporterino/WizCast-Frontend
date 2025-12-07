import { createFileRoute } from '@tanstack/react-router';
import { Button, Code } from '@mantine/core';
import { useState } from 'react';
import { BaseDirectory, appDataDir } from '@tauri-apps/api/path';
import { readDir, readTextFile } from '@tauri-apps/plugin-fs';
import { FlexCol } from '@/components/Layout/FlexCol.tsx';

const RouteComponent = () => {
  const [debugText, setDebugText] = useState<string>('');
  const [debugDir, setDebugDir] = useState<string>('');

  const list = async () => {
    const appDataDirPath = await appDataDir();
    setDebugDir(appDataDirPath);
    setDebugText(JSON.stringify(await readDir('.', { baseDir: BaseDirectory.AppData }), null, 2));
  };

  const read = async () => {
    const appDataDirPath = await appDataDir();
    setDebugDir(appDataDirPath);
    setDebugText(JSON.stringify(JSON.parse(await readTextFile('games.json', { baseDir: BaseDirectory.AppData })), null, 2));
  };

  return (
    <FlexCol fullWidth p={'md'}>
      <Code m={'sm'} style={{ textWrap: 'balance' }}>
        {debugDir}
      </Code>
      <Code block>{debugText}</Code>
      <Button onClick={list}>List Files</Button>
      <Button onClick={read}>Read state file</Button>
    </FlexCol>
  );
};

export const Route = createFileRoute('/debug')({
  component: RouteComponent,
});
