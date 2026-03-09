import 'dart:convert';

import 'package:shared_preferences/shared_preferences.dart';

import 'models.dart';

class AppStateStore {
  static const _stateKey = 'secu_prog_flutter_v1';
  static const _archiveUserKey = 'secu_prog_archive_user_v1';

  Future<AppStateSnapshot> load() async {
    final prefs = await SharedPreferences.getInstance();
    final raw = prefs.getString(_stateKey);
    final archiveUserId = _loadOrCreateArchiveUserId(prefs);

    if (raw == null || raw.isEmpty) {
      return AppStateSnapshot.empty(archiveUserId: archiveUserId);
    }

    try {
      final data = jsonDecode(raw) as Map<String, dynamic>;
      final checks = <String, bool>{};
      final checksJson = data['checks'];
      if (checksJson is Map<String, dynamic>) {
        for (final entry in checksJson.entries) {
          checks[entry.key] = entry.value == true;
        }
      }

      final links = <CustomVeilleLink>[];
      final linksJson = data['customVeilleLinks'];
      if (linksJson is List) {
        for (final value in linksJson) {
          if (value is Map<String, dynamic>) {
            links.add(CustomVeilleLink.fromJson(value));
          }
        }
      }

      final archiveBaseUrl = (data['archiveBaseUrl'] as String?)?.trim();
      return AppStateSnapshot(
        checks: checks,
        customVeilleLinks: links,
        archiveBaseUrl: archiveBaseUrl?.isEmpty == true ? null : archiveBaseUrl,
        archiveUserId: archiveUserId,
      );
    } catch (_) {
      return AppStateSnapshot.empty(archiveUserId: archiveUserId);
    }
  }

  Future<void> save(AppStateSnapshot snapshot) async {
    final prefs = await SharedPreferences.getInstance();
    final json = {
      'checks': snapshot.checks,
      'customVeilleLinks': snapshot.customVeilleLinks
          .map((link) => link.toJson())
          .toList(growable: false),
      'archiveBaseUrl': snapshot.archiveBaseUrl,
    };
    await prefs.setString(_stateKey, jsonEncode(json));
  }

  String _loadOrCreateArchiveUserId(SharedPreferences prefs) {
    final existing = prefs.getString(_archiveUserKey);
    if (existing != null && existing.isNotEmpty) {
      return existing;
    }

    final millis = DateTime.now().millisecondsSinceEpoch;
    final randomPart = (millis * 2654435761).toUnsigned(32).toRadixString(36);
    final userId = 'u_${millis.toRadixString(36)}_$randomPart';
    prefs.setString(_archiveUserKey, userId);
    return userId;
  }
}

class AppStateSnapshot {
  const AppStateSnapshot({
    required this.checks,
    required this.customVeilleLinks,
    required this.archiveUserId,
    this.archiveBaseUrl,
  });

  final Map<String, bool> checks;
  final List<CustomVeilleLink> customVeilleLinks;
  final String archiveUserId;
  final String? archiveBaseUrl;

  factory AppStateSnapshot.empty({required String archiveUserId}) {
    return AppStateSnapshot(
      checks: const {},
      customVeilleLinks: const [],
      archiveUserId: archiveUserId,
      archiveBaseUrl: null,
    );
  }

  AppStateSnapshot copyWith({
    Map<String, bool>? checks,
    List<CustomVeilleLink>? customVeilleLinks,
    String? archiveBaseUrl,
  }) {
    return AppStateSnapshot(
      checks: checks ?? this.checks,
      customVeilleLinks: customVeilleLinks ?? this.customVeilleLinks,
      archiveBaseUrl: archiveBaseUrl ?? this.archiveBaseUrl,
      archiveUserId: archiveUserId,
    );
  }
}
