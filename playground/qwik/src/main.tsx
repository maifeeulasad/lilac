import { render } from '@builder.io/qwik';
import { LilacEditor } from '@lilac-wysiwyg/qwik';

const host = document.getElementById('app')!;
render(
  host,
  <LilacEditor
    toolbar={true}
    value={'<p>Hello from <strong>Qwik</strong>! This editor is the published @lilac-wysiwyg/qwik adapter, built with the Qwik optimizer.</p>'}
  />,
);
