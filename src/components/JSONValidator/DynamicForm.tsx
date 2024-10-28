import { memo, useCallback } from 'react';
import Fields from './Fields';
import { FormState, SchemaType } from '@/types';
import { Button } from '@/components/ui/button';
import { getInitialValue } from '@/lib/utils';
import { PlusCircle, Trash2 } from 'lucide-react';

const DynamicForm = memo(
  ({
    schema,
    formState,
    onChange,
    path = '',
  }: {
    schema: SchemaType;
    formState: FormState;
    onChange: (newState: FormState) => void;
    path?: string;
  }) => {
    const handleChange = useCallback(
      (key: string, value: any) => {
        onChange({
          ...formState,
          [key]: value,
        });
      },
      [formState, onChange],
    );

    const renderField = useCallback(
      (key: string, fieldSchema: any) => {
        const currentPath = path ? `${path}.${key}` : key;
        const value = formState[key];

        if (Array.isArray(fieldSchema)) {
          return (
            <div key={currentPath} className="space-y-4">
              <div className="shadow-md p-4 rounded-lg">
                {' '}
                {/* Added wrapper for the entire hobbies section */}
                <label className="text-sm font-medium">{key}</label>
                <div className="space-y-4">
                  {(value || []).map((item: any, index: number) => (
                    <div
                      key={`${currentPath}-${index}`}
                      className="relative p-4 border rounded-lg shadow-md" // Optional: smaller shadow for individual items
                    >
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => {
                          const newArray = value.filter(
                            (_: any, i: number) => i !== index,
                          );
                          handleChange(key, newArray);
                        }}
                        className="absolute top-2 right-2"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                      <DynamicForm
                        schema={fieldSchema[0]}
                        formState={item}
                        onChange={(newItemState) => {
                          const newArray = [...value];
                          newArray[index] = newItemState;
                          handleChange(key, newArray);
                        }}
                        path={`${currentPath}.${index}`}
                      />
                    </div>
                  ))}
                  <Button
                    variant="outline"
                    onClick={() => {
                      const newItem = getInitialValue(fieldSchema[0]);
                      handleChange(key, [...(value || []), newItem]);
                    }}
                    className="w-full"
                  >
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Add {key}
                  </Button>
                </div>
              </div>
            </div>
          );
        }
        if (typeof fieldSchema === 'string') {
          const Field = Fields[fieldSchema as keyof typeof Fields];
          return Field ? (
            <Field
              key={currentPath}
              name={key}
              value={value}
              onChange={(newValue: any) => handleChange(key, newValue)}
            />
          ) : null;
        }

        if (typeof fieldSchema === 'object') {
          return (
            <div key={currentPath} className="space-y-4 border-l pl-4 mt-4">
              <h3 className="font-semibold">{key}</h3>
              <DynamicForm
                schema={fieldSchema}
                formState={value || {}}
                onChange={(newValue) => handleChange(key, newValue)}
                path={currentPath}
              />
            </div>
          );
        }
      },
      [formState, handleChange, path],
    );

    return (
      <div className="space-y-6">
        {Object.entries(schema).map(([key, fieldSchema]) =>
          renderField(key, fieldSchema),
        )}
      </div>
    );
  },
);

DynamicForm.displayName = 'DynamicForm';

export default DynamicForm;
