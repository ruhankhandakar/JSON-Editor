import { memo } from 'react';

const FieldWrapper = memo(({ name, error, children }: any) => (
  <div className="space-y-2 py-4">
    <label className="text-sm font-medium">{name}</label>
    {children}
    {error && <p className="text-xs text-red-500">{error}</p>}
  </div>
));

FieldWrapper.displayName = 'FieldWrapper';

export default FieldWrapper;
