import 'dart:convert';
import 'dart:io';

import 'package:dio/dio.dart';
import 'package:divoc/generated/l10n.dart';

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

  Resource.idle() : status = Status.IDLE;

  @override
  String toString() {
    return "Status : $status \n Message : $message \n Data : $data";
  }
}

enum Status { LOADING, COMPLETED, ERROR, IDLE }

class Response<T> {
  int code;
  String message;
  T data;
}

class Failure {
  final int code;
  final String message;

  Failure(this.code, this.message);

  @override
  String toString() => "$code $message";
}

typedef MyBlock<T> = Future<T> Function();

Future<T> handleRequest<T>(MyBlock<T> block) async {
  try {
    return block();
  } on Exception catch (exception) {
    throw handleNetworkError(exception);
  }
}

Resource<T> handleError<T>(Object error) {
  if (error is Failure) {
    return Resource.error(error.message);
  } else {
    return Resource.error("Something went wrong");
  }
}

Failure handleNetworkError(Exception exception) {
  if (exception is DioError) {
    if (exception.error is SocketException) {
      return Failure(0, DivocLocalizations.current.msgNoInternet);
    } else if (exception.type == DioErrorType.RESPONSE) {
      var response = json.decode(exception.response.data);
      if (response != null && response["message"] != null) {
        return Failure(exception.response.statusCode, response["message"]);
      }
      return Failure(exception.response.statusCode, "Failed request");
    }
  }
  return Failure(-1, "Unknown error");
}
