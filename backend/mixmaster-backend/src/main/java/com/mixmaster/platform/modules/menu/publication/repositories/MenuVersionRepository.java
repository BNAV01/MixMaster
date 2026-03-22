package com.mixmaster.platform.modules.menu.publication.repositories;

import com.mixmaster.platform.modules.menu.publication.models.MenuVersion;
import com.mixmaster.platform.modules.menu.publication.models.MenuVersionStatus;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MenuVersionRepository extends JpaRepository<MenuVersion, String> {

    List<MenuVersion> findAllByMenu_IdOrderByVersionNumberDesc(String menuId);

    Optional<MenuVersion> findTopByMenu_IdAndStatusOrderByVersionNumberDesc(String menuId, MenuVersionStatus status);
}
