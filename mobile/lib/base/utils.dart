class Pair<F, S> {
  Pair(this.first, this.second);

  final F first;
  final S second;

  @override
  String toString() => 'Pair[$first, $second]';
}

class Resource<T> {
  Status status;
  T data;
  String message;

  Resource.loading(this.message) : status = Status.LOADING;

  Resource.completed(this.data) : status = Status.COMPLETED;

  Resource.error(this.message) : status = Status.ERROR;

  @override
  String toString() {
    return "Status : $status \n Message : $message \n Data : $data";
  }
}

enum Status { LOADING, COMPLETED, ERROR }

class Response<T> {
  int code;
  String message;
  T data;
}
