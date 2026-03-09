import 'dart:math';

import 'package:flutter/material.dart';

import '../../data/app_state_store.dart';
import '../../data/archive_api.dart';
import '../../data/models.dart';
import '../../data/sec_data.dart';
import '../../theme/app_theme.dart';
import 'archive_view_page.dart';

class SecHomePage extends StatefulWidget {
  const SecHomePage({super.key});

  @override
  State<SecHomePage> createState() => _SecHomePageState();
}

class _SecHomePageState extends State<SecHomePage> {
  final AppStateStore _store = AppStateStore();

  bool _loading = true;
  Map<String, bool> _checks = {};
  List<CustomVeilleLink> _customLinks = [];
  String _archiveUserId = '';
  String _archiveBaseUrl = 'http://10.0.2.2:4173';
  List<ArchiveIndexItem> _archives = [];
  String _archiveStatus = 'Aucune archive chargee.';

  @override
  void initState() {
    super.initState();
    _bootstrap();
  }

  Future<void> _bootstrap() async {
    final snapshot = await _store.load();
    setState(() {
      _checks = Map<String, bool>.from(snapshot.checks);
      _customLinks = List<CustomVeilleLink>.from(snapshot.customVeilleLinks);
      _archiveUserId = snapshot.archiveUserId;
      if ((snapshot.archiveBaseUrl ?? '').trim().isNotEmpty) {
        _archiveBaseUrl = snapshot.archiveBaseUrl!.trim();
      }
      _loading = false;
    });
    await _loadArchives();
  }

  Future<void> _persist() {
    return _store.save(
      AppStateSnapshot(
        checks: _checks,
        customVeilleLinks: _customLinks,
        archiveUserId: _archiveUserId,
        archiveBaseUrl: _archiveBaseUrl,
      ),
    );
  }

  bool _isChecked(String id) => _checks[id] == true;

  Future<void> _setChecked(String id, bool value) async {
    setState(() => _checks[id] = value);
    await _persist();
  }

  int get _totalWeekTasks => weekPlans.fold(0, (sum, week) => sum + week.tasks.length);

  int get _doneWeekTasks => weekPlans
      .expand((week) => week.tasks)
      .where((task) => _isChecked(task.id))
      .length;

  int get _totalPsLabs => psModules.fold(0, (sum, mod) => sum + mod.labs.length);

  int get _donePsLabs {
    var done = 0;
    for (final mod in psModules) {
      for (var i = 0; i < mod.labs.length; i++) {
        if (_isChecked('ps_${mod.id}_$i')) done++;
      }
    }
    return done;
  }

  int get _doneBookTasks =>
      bookTasks.where((task) => _isChecked('task_${task.id}')).length;

  int get _reviewDoneCount => bookTasks
      .where((task) => task.review)
      .where((task) => _isChecked('task_${task.id}'))
      .length;

  int get _donePhrack => phrackItems.where((item) => _isChecked('phrack_${item.id}')).length;

  List<ArticleItem> get _allArticles {
    final custom = _customLinks
        .map(
          (link) => ArticleItem(
            id: 'art_custom_${link.id}',
            category: 'Custom veille',
            title: link.name,
            url: link.url,
            when: 'Custom',
          ),
        )
        .toList(growable: false);
    return [...baseArticles, ...custom];
  }

  int get _doneArticles => _allArticles.where((a) => _isChecked(a.id)).length;

  int get _totalAllChecks =>
      _totalWeekTasks + _totalPsLabs + bookTasks.length + phrackItems.length + _allArticles.length;

  int get _doneAllChecks =>
      _doneWeekTasks + _donePsLabs + _doneBookTasks + _donePhrack + _doneArticles;

  int get _bugBountyDone => weekPlans
      .expand((week) => week.tasks)
      .where((task) => task.isBugBounty)
      .where((task) => _isChecked(task.id))
      .length;

  double get _phaseProgress {
    if (_totalWeekTasks == 0) return 0;
    return _doneWeekTasks / _totalWeekTasks;
  }

  ArchiveApi get _archiveApi => ArchiveApi(
        baseUrl: _archiveBaseUrl,
        archiveUserId: _archiveUserId,
      );

  String _normalizeUrl(String input) {
    final trimmed = input.trim();
    if (trimmed.isEmpty) return '';
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
      return trimmed;
    }
    return 'https://$trimmed';
  }

  bool _sameUrl(String left, String right) {
    final l = _normalizeUrl(left);
    final r = _normalizeUrl(right);
    return l == r;
  }

  Future<void> _loadArchives() async {
    try {
      final items = await _archiveApi.listArchives();
      if (!mounted) return;
      setState(() {
        _archives = items;
        _archiveStatus = '${items.length} archive(s) locale(s).';
      });
    } on ArchiveApiException catch (error) {
      if (!mounted) return;
      setState(() => _archiveStatus = error.message);
    } catch (_) {
      if (!mounted) return;
      setState(() => _archiveStatus = 'Serveur archive indisponible.');
    }
  }

  Future<void> _openArchiveById(String id) async {
    try {
      final snapshot = await _archiveApi.getArchive(id);
      if (!mounted) return;
      await Navigator.of(context).push(
        MaterialPageRoute<void>(
          builder: (_) => ArchiveViewPage(title: snapshot.title, html: snapshot.html),
        ),
      );
      setState(() => _archiveStatus = 'Lecture locale: ${snapshot.title}');
    } on ArchiveApiException catch (error) {
      setState(() => _archiveStatus = error.message);
    }
  }

  Future<void> _openLiveArticle(ArticleItem item) {
    return Navigator.of(context).push(
      MaterialPageRoute<void>(
        builder: (_) => ArchiveViewPage(title: item.title, url: item.url),
      ),
    );
  }

  Future<void> _archiveOrOpen(ArticleItem item) async {
    final existing = _archives.where((entry) => _sameUrl(entry.url, item.url)).toList();
    if (existing.isNotEmpty) {
      await _openArchiveById(existing.first.id);
      return;
    }

    setState(() => _archiveStatus = 'Archivage en cours...');
    try {
      await _archiveApi.createArchive(url: item.url, title: item.title);
      await _loadArchives();
      final created = _archives.where((entry) => _sameUrl(entry.url, item.url)).toList();
      if (created.isNotEmpty) {
        await _openArchiveById(created.first.id);
      }
    } on ArchiveApiException catch (error) {
      setState(() => _archiveStatus = 'Archivage echoue: ${error.message}');
    }
  }

  Future<void> _deleteArchive(String id) async {
    try {
      await _archiveApi.deleteArchive(id);
      await _loadArchives();
      if (!mounted) return;
      setState(() => _archiveStatus = 'Archive supprimee.');
    } on ArchiveApiException catch (error) {
      setState(() => _archiveStatus = error.message);
    }
  }

  Future<void> _showArchiveLibrary() async {
    await _loadArchives();
    if (!mounted) return;

    showModalBottomSheet<void>(
      context: context,
      isScrollControlled: true,
      backgroundColor: const Color(0xFF13222B),
      builder: (context) {
        return SafeArea(
          child: FractionallySizedBox(
            heightFactor: 0.8,
            child: StatefulBuilder(
              builder: (context, setModal) {
                return Column(
                  children: [
                    const SizedBox(height: 10),
                    Container(
                      width: 52,
                      height: 5,
                      decoration: BoxDecoration(
                        color: Colors.white24,
                        borderRadius: BorderRadius.circular(999),
                      ),
                    ),
                    Padding(
                      padding: const EdgeInsets.all(16),
                      child: Row(
                        children: [
                          const Text('Bibliotheque offline', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w700)),
                          const Spacer(),
                          IconButton(
                            onPressed: () async {
                              await _loadArchives();
                              setModal(() {});
                            },
                            icon: const Icon(Icons.refresh_rounded),
                          ),
                        ],
                      ),
                    ),
                    if (_archives.isEmpty)
                      Expanded(
                        child: Center(
                          child: Text(_archiveStatus, style: Theme.of(context).textTheme.bodySmall),
                        ),
                      )
                    else
                      Expanded(
                        child: ListView.builder(
                          itemCount: _archives.length,
                          itemBuilder: (context, index) {
                            final item = _archives[index];
                            return ListTile(
                              title: Text(item.title, maxLines: 1, overflow: TextOverflow.ellipsis),
                              subtitle: Text(item.url, maxLines: 1, overflow: TextOverflow.ellipsis),
                              trailing: Row(
                                mainAxisSize: MainAxisSize.min,
                                children: [
                                  IconButton(
                                    icon: const Icon(Icons.open_in_new_rounded),
                                    onPressed: () => _openArchiveById(item.id),
                                  ),
                                  IconButton(
                                    icon: const Icon(Icons.delete_outline_rounded),
                                    onPressed: () async {
                                      await _deleteArchive(item.id);
                                      setModal(() {});
                                    },
                                  ),
                                ],
                              ),
                            );
                          },
                        ),
                      ),
                    Padding(
                      padding: const EdgeInsets.fromLTRB(16, 0, 16, 16),
                      child: Text(_archiveStatus, style: Theme.of(context).textTheme.bodySmall),
                    ),
                  ],
                );
              },
            ),
          ),
        );
      },
    );
  }

  Future<void> _showArchiveSettings() async {
    final controller = TextEditingController(text: _archiveBaseUrl);
    final result = await showDialog<String>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Archive API base URL'),
        content: TextField(
          controller: controller,
          decoration: const InputDecoration(
            labelText: 'ex: http://10.0.2.2:4173',
          ),
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context), child: const Text('Cancel')),
          FilledButton(
            onPressed: () => Navigator.pop(context, controller.text.trim()),
            child: const Text('Save'),
          ),
        ],
      ),
    );

    if (result == null || result.isEmpty) return;
    setState(() => _archiveBaseUrl = result);
    await _persist();
    await _loadArchives();
  }

  Future<void> _addCustomVeilleLink() async {
    final nameCtrl = TextEditingController();
    final urlCtrl = TextEditingController();

    final ok = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Ajouter lien veille'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            TextField(controller: nameCtrl, decoration: const InputDecoration(labelText: 'Nom')),
            const SizedBox(height: 10),
            TextField(controller: urlCtrl, decoration: const InputDecoration(labelText: 'URL')),
          ],
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context, false), child: const Text('Cancel')),
          FilledButton(onPressed: () => Navigator.pop(context, true), child: const Text('Add')),
        ],
      ),
    );

    if (ok != true) return;

    final name = nameCtrl.text.trim();
    final url = _normalizeUrl(urlCtrl.text);
    if (name.isEmpty || url.isEmpty) return;

    final random = Random().nextInt(1 << 31).toRadixString(36);
    final id = '${DateTime.now().millisecondsSinceEpoch.toRadixString(36)}_$random';

    setState(() {
      _customLinks = [..._customLinks, CustomVeilleLink(id: id, name: name, url: url)];
      _checks['art_custom_$id'] = false;
    });
    await _persist();
  }

  Future<void> _removeCustomVeilleLink(String linkId) async {
    setState(() {
      _customLinks = _customLinks.where((link) => link.id != linkId).toList(growable: false);
      _checks.remove('art_custom_$linkId');
    });
    await _persist();
  }

  Widget _heroCard() {
    final textTheme = Theme.of(context).textTheme;
    return Container(
      margin: const EdgeInsets.fromLTRB(16, 12, 16, 8),
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          colors: [Color(0xFF1C3443), Color(0xFF203141), Color(0xFF3B2A2A)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(26),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text('SECU // PROG', style: textTheme.bodySmall?.copyWith(letterSpacing: 1.2)),
          const SizedBox(height: 8),
          Text('Learn by doing.\nBreak by understanding.', style: textTheme.headlineMedium),
          const SizedBox(height: 14),
          ClipRRect(
            borderRadius: BorderRadius.circular(999),
            child: LinearProgressIndicator(
              minHeight: 10,
              value: _phaseProgress,
              backgroundColor: Colors.white12,
            ),
          ),
          const SizedBox(height: 10),
          Text(
            'Phase progress: ${(_phaseProgress * 100).round()}%   •   $_doneAllChecks / $_totalAllChecks tasks',
            style: textTheme.bodySmall,
          ),
        ],
      ),
    );
  }

  Widget _statsRow() {
    final cards = [
      ('Done', _doneAllChecks.toString()),
      ('Total', _totalAllChecks.toString()),
      ('Reviews', _reviewDoneCount.toString()),
      ('Labs', _donePsLabs.toString()),
      ('BB Nights', _bugBountyDone.toString()),
    ];

    return SizedBox(
      height: 104,
      child: ListView.separated(
        padding: const EdgeInsets.symmetric(horizontal: 16),
        scrollDirection: Axis.horizontal,
        itemCount: cards.length,
        separatorBuilder: (_, __) => const SizedBox(width: 10),
        itemBuilder: (context, index) {
          final item = cards[index];
          return Container(
            width: 120,
            padding: const EdgeInsets.all(14),
            decoration: BoxDecoration(
              color: const Color(0xFF13222B),
              borderRadius: BorderRadius.circular(18),
              border: Border.all(color: Colors.white10),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(item.$2, style: const TextStyle(fontSize: 28, fontWeight: FontWeight.w800)),
                const Spacer(),
                Text(item.$1, style: Theme.of(context).textTheme.bodySmall),
              ],
            ),
          );
        },
      ),
    );
  }

  Widget _sectionTitle(String title, String subtitle, {List<Widget> actions = const []}) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 22, 16, 10),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(title, style: Theme.of(context).textTheme.titleLarge),
                const SizedBox(height: 3),
                Text(subtitle, style: Theme.of(context).textTheme.bodySmall),
              ],
            ),
          ),
          ...actions,
        ],
      ),
    );
  }

  Widget _weeksSection() {
    return Column(
      children: [
        _sectionTitle('Phase timeline', 'Weekly tasks + progress from sec.html'),
        ...weekPlans.map((week) {
          final done = week.tasks.where((task) => _isChecked(task.id)).length;
          final pct = week.tasks.isEmpty ? 0 : ((done / week.tasks.length) * 100).round();

          return Padding(
            padding: const EdgeInsets.fromLTRB(16, 0, 16, 10),
            child: Card(
              child: ExpansionTile(
                tilePadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
                title: Text('${week.code}  ${week.title}'),
                subtitle: Text('${week.range}  •  $pct%'),
                children: week.tasks
                    .map(
                      (task) => CheckboxListTile(
                        value: _isChecked(task.id),
                        onChanged: (v) => _setChecked(task.id, v ?? false),
                        title: Text('${task.track} - ${task.title}'),
                        subtitle: Text(task.detail),
                        controlAffinity: ListTileControlAffinity.leading,
                      ),
                    )
                    .toList(growable: false),
              ),
            ),
          );
        }),
      ],
    );
  }

  Widget _psSection() {
    return Column(
      children: [
        _sectionTitle('PortSwigger tracker', '$_donePsLabs / $_totalPsLabs labs complete'),
        ...psModules.map((module) {
          var moduleDone = 0;
          for (var i = 0; i < module.labs.length; i++) {
            if (_isChecked('ps_${module.id}_$i')) moduleDone++;
          }

          return Padding(
            padding: const EdgeInsets.fromLTRB(16, 0, 16, 10),
            child: Card(
              child: ExpansionTile(
                title: Text(module.name),
                subtitle: Text('${module.month}  •  $moduleDone/${module.labs.length}'),
                children: List.generate(module.labs.length, (index) {
                  final key = 'ps_${module.id}_$index';
                  return CheckboxListTile(
                    value: _isChecked(key),
                    onChanged: (v) => _setChecked(key, v ?? false),
                    title: Text(module.labs[index]),
                    controlAffinity: ListTileControlAffinity.leading,
                  );
                }),
              ),
            ),
          );
        }),
      ],
    );
  }

  Widget _booksSection() {
    final grouped = <String, List<BookTask>>{};
    for (final task in bookTasks) {
      grouped.putIfAbsent(task.book, () => []).add(task);
    }

    return Column(
      children: [
        _sectionTitle('Books and reviews', '$_doneBookTasks / ${bookTasks.length} completed'),
        ...grouped.entries.map(
          (entry) => Padding(
            padding: const EdgeInsets.fromLTRB(16, 0, 16, 10),
            child: Card(
              child: ExpansionTile(
                title: Text(entry.key),
                children: entry.value
                    .map(
                      (task) => CheckboxListTile(
                        value: _isChecked('task_${task.id}'),
                        onChanged: (v) => _setChecked('task_${task.id}', v ?? false),
                        title: Text(task.title),
                        subtitle: task.review ? const Text('Review milestone') : null,
                        controlAffinity: ListTileControlAffinity.leading,
                      ),
                    )
                    .toList(growable: false),
              ),
            ),
          ),
        ),
      ],
    );
  }

  Widget _phrackSection() {
    return Column(
      children: [
        _sectionTitle('Phrack', '$_donePhrack / ${phrackItems.length} read'),
        ...phrackItems.map(
          (item) => Padding(
            padding: const EdgeInsets.fromLTRB(16, 0, 16, 8),
            child: Card(
              child: CheckboxListTile(
                value: _isChecked('phrack_${item.id}'),
                onChanged: (v) => _setChecked('phrack_${item.id}', v ?? false),
                title: Text('${item.reference}  ${item.title}'),
                subtitle: Text(item.when),
                controlAffinity: ListTileControlAffinity.leading,
              ),
            ),
          ),
        ),
      ],
    );
  }

  Widget _articlesSection() {
    final groups = <String, List<ArticleItem>>{};
    for (final article in _allArticles) {
      groups.putIfAbsent(article.category, () => []).add(article);
    }

    return Column(
      children: [
        _sectionTitle(
          'Articles and offline archive',
          '$_doneArticles / ${_allArticles.length} checked',
          actions: [
            IconButton(
              tooltip: 'Archive settings',
              onPressed: _showArchiveSettings,
              icon: const Icon(Icons.settings_rounded),
            ),
            IconButton(
              tooltip: 'Archive library',
              onPressed: _showArchiveLibrary,
              icon: const Icon(Icons.inventory_2_rounded),
            ),
            IconButton(
              tooltip: 'Add custom veille',
              onPressed: _addCustomVeilleLink,
              icon: const Icon(Icons.add_circle_outline_rounded),
            ),
          ],
        ),
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16),
          child: Align(
            alignment: Alignment.centerLeft,
            child: Text(_archiveStatus, style: Theme.of(context).textTheme.bodySmall),
          ),
        ),
        const SizedBox(height: 8),
        ...groups.entries.map(
          (entry) => Padding(
            padding: const EdgeInsets.fromLTRB(16, 0, 16, 10),
            child: Card(
              child: ExpansionTile(
                title: Text(entry.key),
                children: entry.value.map((article) {
                  final archived = _archives.any((item) => _sameUrl(item.url, article.url));
                  final isCustom = article.id.startsWith('art_custom_');
                  return Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 10),
                    child: Column(
                      children: [
                        CheckboxListTile(
                          value: _isChecked(article.id),
                          onChanged: (v) => _setChecked(article.id, v ?? false),
                          title: Text(article.title),
                          subtitle: Text(article.when),
                          controlAffinity: ListTileControlAffinity.leading,
                        ),
                        Padding(
                          padding: const EdgeInsets.fromLTRB(50, 0, 10, 12),
                          child: Wrap(
                            spacing: 8,
                            runSpacing: 8,
                            children: [
                              OutlinedButton.icon(
                                onPressed: () => _openLiveArticle(article),
                                icon: const Icon(Icons.open_in_browser_rounded),
                                label: const Text('Open live'),
                              ),
                              FilledButton.icon(
                                onPressed: () => _archiveOrOpen(article),
                                icon: Icon(archived ? Icons.folder_open_rounded : Icons.download_rounded),
                                label: Text(archived ? 'Read local' : 'Archive'),
                              ),
                              if (isCustom)
                                TextButton.icon(
                                  onPressed: () => _removeCustomVeilleLink(article.id.replaceFirst('art_custom_', '')),
                                  icon: const Icon(Icons.delete_outline_rounded),
                                  label: const Text('Remove'),
                                ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  );
                }).toList(growable: false),
              ),
            ),
          ),
        ),
      ],
    );
  }

  @override
  Widget build(BuildContext context) {
    if (_loading) {
      return const Scaffold(body: Center(child: CircularProgressIndicator()));
    }

    return Scaffold(
      appBar: AppBar(
        title: const Text('SECU mobile'),
        actions: [
          IconButton(onPressed: _loadArchives, icon: const Icon(Icons.cloud_sync_rounded)),
        ],
      ),
      body: DecoratedBox(
        decoration: const BoxDecoration(gradient: AppTheme.backgroundGradient),
        child: ListView(
          children: [
            _heroCard(),
            _statsRow(),
            _weeksSection(),
            _psSection(),
            _booksSection(),
            _phrackSection(),
            _articlesSection(),
            const SizedBox(height: 24),
          ],
        ),
      ),
    );
  }
}
