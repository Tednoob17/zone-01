class WeekPlan {
  const WeekPlan({
    required this.id,
    required this.code,
    required this.title,
    required this.range,
    required this.tasks,
  });

  final String id;
  final String code;
  final String title;
  final String range;
  final List<PlanTask> tasks;
}

class PlanTask {
  const PlanTask({
    required this.id,
    required this.track,
    required this.title,
    required this.detail,
    this.isBugBounty = false,
  });

  final String id;
  final String track;
  final String title;
  final String detail;
  final bool isBugBounty;
}

class PsModule {
  const PsModule({
    required this.id,
    required this.name,
    required this.month,
    required this.labs,
  });

  final String id;
  final String name;
  final String month;
  final List<String> labs;
}

class BookTask {
  const BookTask({
    required this.id,
    required this.book,
    required this.title,
    this.review = false,
  });

  final String id;
  final String book;
  final String title;
  final bool review;
}

class PhrackItem {
  const PhrackItem({
    required this.id,
    required this.reference,
    required this.title,
    required this.when,
  });

  final String id;
  final String reference;
  final String title;
  final String when;
}

class ArticleItem {
  const ArticleItem({
    required this.id,
    required this.category,
    required this.title,
    required this.url,
    required this.when,
  });

  final String id;
  final String category;
  final String title;
  final String url;
  final String when;
}

class CustomVeilleLink {
  const CustomVeilleLink({
    required this.id,
    required this.name,
    required this.url,
  });

  final String id;
  final String name;
  final String url;

  Map<String, dynamic> toJson() => {'id': id, 'name': name, 'url': url};

  factory CustomVeilleLink.fromJson(Map<String, dynamic> json) {
    return CustomVeilleLink(
      id: json['id'] as String? ?? '',
      name: json['name'] as String? ?? '',
      url: json['url'] as String? ?? '',
    );
  }
}

class ArchiveIndexItem {
  const ArchiveIndexItem({
    required this.id,
    required this.url,
    required this.title,
    required this.createdAt,
  });

  final String id;
  final String url;
  final String title;
  final String createdAt;

  factory ArchiveIndexItem.fromJson(Map<String, dynamic> json) {
    return ArchiveIndexItem(
      id: json['id'] as String? ?? '',
      url: json['url'] as String? ?? '',
      title: json['title'] as String? ?? 'Untitled',
      createdAt: json['createdAt'] as String? ?? '',
    );
  }
}

class ArchiveSnapshot {
  const ArchiveSnapshot({
    required this.id,
    required this.url,
    required this.title,
    required this.createdAt,
    required this.html,
  });

  final String id;
  final String url;
  final String title;
  final String createdAt;
  final String html;

  factory ArchiveSnapshot.fromJson(Map<String, dynamic> json) {
    return ArchiveSnapshot(
      id: json['id'] as String? ?? '',
      url: json['url'] as String? ?? '',
      title: json['title'] as String? ?? 'Untitled',
      createdAt: json['createdAt'] as String? ?? '',
      html: json['html'] as String? ?? '<p>Archive vide</p>',
    );
  }
}
