import Dialog from "@material-ui/core/Dialog";

const DialogForm = ({
  open,
  onClose,
  onSubmit,
  children,
  ...rest
}: {
  open: boolean;
  onClose: any;
  onSubmit: any;
  children: any;
}) => {
  return (
    <Dialog
      open={open}
      PaperProps={{
        component: "form",
        onSubmit: (e) => {
          e.preventDefault();
          if (onSubmit) {
            onSubmit();
          }
        },
      }}
      onClose={onClose}
      {...rest}
    >
      {children}
    </Dialog>
  );
};

export default DialogForm;
