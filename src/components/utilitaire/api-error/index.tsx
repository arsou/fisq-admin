export type ApiErrorProps = { error: string; success: string };

export const ApiError = (props: ApiErrorProps) => {
  const show = props.error !== "" || props.success !== "";
  const col = props.error !== "" ? "bg-danger" : "bg-primary";
  const msg = [props.error, props.success].join(" ");
  return (
    <>
      {show && (
        <div className={`toast text-white my-2 ${col}`}>
          <div className="d-flex justify-content-around">
            <div
              className="toast-body"
              dangerouslySetInnerHTML={{ __html: msg }}
            />
            <button
              type="button"
              className="btn-close btn-close-white me-2 m-auto"
              data-bs-dismiss="toast"
            />
          </div>
        </div>
      )}
    </>
  );
};
