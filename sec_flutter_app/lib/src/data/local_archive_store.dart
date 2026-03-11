import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';

class LocalArchiveStore {
  static const _key = 'ahsec_local_archives_v1';

  Future<List<ArchivedArticle>> list() async {
    final prefs = await SharedPreferences.getInstance();
    final raw = prefs.getString(_key);
    if (raw == null || raw.isEmpty) return [];
    try {
      final decoded = jsonDecode(raw) as List;
      return decoded
          .whereType<Map<String, dynamic>>()
          .map(ArchivedArticle.fromJson)
          .toList(growable: false);
    } catch (_) {
      return [];
    }
  }

  Future<void> save(ArchivedArticle article) async {
    final items = await list();
    // Replace if same URL already archived
    final filtered = items.where((a) => a.url != article.url).toList();
    filtered.insert(0, article);
    await _persist(filtered);
  }

  Future<ArchivedArticle?> findByUrl(String url) async {
    final items = await list();
    final normalized = _normalize(url);
    for (final item in items) {
      if (_normalize(item.url) == normalized) return item;
    }
    return null;
  }

  Future<void> delete(String id) async {
    final items = await list();
    final filtered = items.where((a) => a.id != id).toList();
    await _persist(filtered);
  }

  Future<void> _persist(List<ArchivedArticle> items) async {
    final prefs = await SharedPreferences.getInstance();
    final json = items.map((a) => a.toJson()).toList(growable: false);
    await prefs.setString(_key, jsonEncode(json));
  }

  String _normalize(String url) {
    final trimmed = url.trim();
    if (trimmed.isEmpty) return '';
    try {
      return Uri.parse(trimmed).toString();
    } catch (_) {
      return trimmed;
    }
  }
}

class ArchivedArticle {
  const ArchivedArticle({
    required this.id,
    required this.url,
    required this.title,
    required this.html,
    required this.createdAt,
  });

  final String id;
  final String url;
  final String title;
  final String html;
  final String createdAt;

  Map<String, dynamic> toJson() => {
        'id': id,
        'url': url,
        'title': title,
        'html': html,
        'createdAt': createdAt,
      };

  factory ArchivedArticle.fromJson(Map<String, dynamic> json) {
    return ArchivedArticle(
      id: json['id'] as String? ?? '',
      url: json['url'] as String? ?? '',
      title: json['title'] as String? ?? 'Sans titre',
      html: json['html'] as String? ?? '',
      createdAt: json['createdAt'] as String? ?? '',
    );
  }
}
