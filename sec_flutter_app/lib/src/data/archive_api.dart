import 'dart:convert';

import 'package:http/http.dart' as http;

import 'models.dart';

class ArchiveApi {
  ArchiveApi({required this.baseUrl, required this.archiveUserId})
      : _baseUri = Uri.parse(baseUrl);

  final String baseUrl;
  final String archiveUserId;
  final Uri _baseUri;

  Future<List<ArchiveIndexItem>> listArchives() async {
    final response = await _send('GET', '/api/archive');
    if (response.statusCode != 200) {
      throw ArchiveApiException(_friendlyMessage(response.statusCode));
    }

    final data = _decodeJson(response.body);
    final rawItems = data['items'];
    if (rawItems is! List) {
      return const [];
    }

    return rawItems
        .whereType<Map<String, dynamic>>()
        .map(ArchiveIndexItem.fromJson)
        .toList(growable: false);
  }

  Future<ArchiveSnapshot> getArchive(String id) async {
    final response = await _send('GET', '/api/archive/$id');
    if (response.statusCode != 200) {
      throw ArchiveApiException('Impossible d\'ouvrir cette archive.');
    }

    final data = _decodeJson(response.body);
    return ArchiveSnapshot.fromJson(data);
  }

  Future<void> deleteArchive(String id) async {
    final response = await _send('DELETE', '/api/archive/$id');
    if (response.statusCode != 200) {
      throw ArchiveApiException('Suppression impossible.');
    }
  }

  Future<ArchiveIndexItem> createArchive({
    required String url,
    String title = '',
  }) async {
    final response = await _send(
      'POST',
      '/api/archive',
      body: jsonEncode({'url': url, 'title': title}),
      headers: {'Content-Type': 'application/json'},
    );

    if (response.statusCode != 200 && response.statusCode != 201) {
      final payload = _decodeJson(response.body, silent: true);
      final apiError = payload['error'];
      throw ArchiveApiException(
        apiError is String && apiError.isNotEmpty
            ? apiError
            : 'Archivage echoue (${response.statusCode}).',
      );
    }

    final data = _decodeJson(response.body);
    final item = data['item'];
    if (item is! Map<String, dynamic>) {
      throw ArchiveApiException('Archive creee mais reponse invalide.');
    }
    return ArchiveIndexItem.fromJson(item);
  }

  Future<http.Response> _send(
    String method,
    String path, {
    String? body,
    Map<String, String>? headers,
  }) {
    final uri = _baseUri.resolve(path);
    final finalHeaders = <String, String>{
      'X-Archive-User': archiveUserId,
      ...?headers,
    };

    switch (method) {
      case 'GET':
        return http.get(uri, headers: finalHeaders);
      case 'POST':
        return http.post(uri, headers: finalHeaders, body: body);
      case 'DELETE':
        return http.delete(uri, headers: finalHeaders);
      default:
        throw ArchiveApiException('HTTP method not supported.');
    }
  }

  Map<String, dynamic> _decodeJson(String raw, {bool silent = false}) {
    try {
      final data = jsonDecode(raw);
      if (data is Map<String, dynamic>) {
        return data;
      }
      return {};
    } catch (_) {
      if (silent) {
        return {};
      }
      throw ArchiveApiException('Reponse serveur invalide.');
    }
  }

  String _friendlyMessage(int statusCode) {
    if (statusCode == 404) {
      return 'API /api/archive introuvable. Lance archive-server.js localement.';
    }
    if (statusCode == 503) {
      return 'Archive backend non configure (KV/Redis manquant).';
    }
    return 'Serveur archive indisponible (HTTP $statusCode).';
  }
}

class ArchiveApiException implements Exception {
  ArchiveApiException(this.message);

  final String message;

  @override
  String toString() => message;
}
